// lib/pixelMask.ts
// 画像の不透明ピクセル(α >= threshold)を Uint8Array に格納する。
// width * height のフラットな1次元配列で、1=不透明, 0=透明 として扱う。

export interface PixelMask {
  width: number;     // 元画像のピクセル幅
  height: number;    // 元画像のピクセル高さ
  data: Uint8Array;  // length === width * height
}

const ALPHA_THRESHOLD = 16; // これ未満は「透明」とみなす(0〜255)

const maskCache = new WeakMap<HTMLImageElement, PixelMask>();

/**
 * 画像から α マスクを取得(初回のみ生成、以降キャッシュ)。
 * 画像がまだロードできていない場合は null を返す。
 */
export function getPixelMask(img: HTMLImageElement): PixelMask | null {
  if (!img.complete || img.naturalWidth === 0) return null;

  const cached = maskCache.get(img);
  if (cached) return cached;

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // OffscreenCanvas が使えるならそちらの方が速いが、互換のため通常の canvas で。
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch {
    // CORS 汚染で読めない場合は null
    return null;
  }

  const src = imgData.data; // RGBA 連続
  const mask = new Uint8Array(w * h);
  for (let i = 0, p = 0; i < src.length; i += 4, p++) {
    mask[p] = src[i + 3] >= ALPHA_THRESHOLD ? 1 : 0;
  }

  const result: PixelMask = { width: w, height: h, data: mask };
  maskCache.set(img, result);
  return result;
}

/**
 * 2つのスプライトの当たり判定(画面座標系)。
 * 各スプライトは「左上座標 (x,y) と表示サイズ (w,h) と元画像」で表す。
 * 表示サイズが画像サイズと違ってもOK(マスク参照時にスケール変換する)。
 *
 * @returns 不透明ピクセル同士が1ピクセルでも重なれば true
 */
export function pixelOverlap(
  a: { x: number; y: number; w: number; h: number; img: HTMLImageElement },
  b: { x: number; y: number; w: number; h: number; img: HTMLImageElement }
): boolean {
  // 1. AABB(矩形)で素早く除外
  const left = Math.max(a.x, b.x);
  const right = Math.min(a.x + a.w, b.x + b.w);
  const top = Math.max(a.y, b.y);
  const bottom = Math.min(a.y + a.h, b.y + b.h);
  if (right <= left || bottom <= top) return false;

  // 2. マスク取得(片方でもマスクが取れなければ AABB の結果を採用)
  const maskA = getPixelMask(a.img);
  const maskB = getPixelMask(b.img);
  if (!maskA || !maskB) return true; // フォールバック:矩形当たり判定

  // 表示サイズ → 元画像サイズへのスケール係数
  const sxA = maskA.width / a.w;
  const syA = maskA.height / a.h;
  const sxB = maskB.width / b.w;
  const syB = maskB.height / b.h;

  // 3. 重なり領域を粗めにステップで走査(STEP=2 にすると約1/4のコストで済む)
  const STEP = 2;
  for (let py = Math.floor(top); py < bottom; py += STEP) {
    for (let px = Math.floor(left); px < right; px += STEP) {
      // それぞれの画像内のピクセル座標
      const axi = Math.floor((px - a.x) * sxA);
      const ayi = Math.floor((py - a.y) * syA);
      const bxi = Math.floor((px - b.x) * sxB);
      const byi = Math.floor((py - b.y) * syB);

      // 範囲外チェック(浮動小数のはみ出しガード)
      if (
        axi < 0 || ayi < 0 || axi >= maskA.width || ayi >= maskA.height ||
        bxi < 0 || byi < 0 || bxi >= maskB.width || byi >= maskB.height
      ) continue;

      if (maskA.data[ayi * maskA.width + axi] && maskB.data[byi * maskB.width + bxi]) {
        return true;
      }
    }
  }
  return false;
}