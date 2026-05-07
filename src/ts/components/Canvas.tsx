import { useEffect, useRef } from "react";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CLOUD_HEIGHT,
  CLOUD_WIDTH,
  GROUND_Y,
  MEAT_HEIGHT,
  MEAT_WIDTH,
} from "../lib/constants";
import { getDogFrame } from "../lib/dogImages";
import type { EnemyType, GameState } from "../lib/state";

// ============================================================
// 画像ロード(モジュールスコープで一度だけ)
// ============================================================
function loadImage(path: string): HTMLImageElement {
  const img = new Image();
  img.src = `${import.meta.env.BASE_URL}${path}`;
  return img;
}

const groundImage = loadImage("images/Game/ground.png");
const meatImage = loadImage("images/Game/meat.png");
const cloudImage = loadImage("images/Game/cloud.png");
const enemyImages: Record<EnemyType, HTMLImageElement> = {
  bee: loadImage("images/Game/enemy/bee.png"),
  bicycle: loadImage("images/Game/enemy/bicycle.png"),
  doktor: loadImage("images/Game/enemy/doktor.png"),
  f35: loadImage("images/Game/enemy/f35.png"),
};

// 横方向のみ繰り返すパターン(初回描画時に作成)
let groundPattern: CanvasPattern | null = null;

interface CanvasProps {
  stateRef: React.MutableRefObject<GameState>;
  onTick: (dt: number) => void;
}

export default function Canvas({ stateRef, onTick }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(now - lastTime, 100);
      lastTime = now;

      onTick(dt);
      render(ctx, stateRef.current);

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [stateRef, onTick]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ display: "block", background: "#87ceeb" }}
    />
  );
}

// 描画
function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  // 空
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // パターン未作成なら作る(画像ロード完了後の初回のみ)
  if (
    !groundPattern &&
    groundImage.complete &&
    groundImage.naturalWidth > 0
  ) {
    // "repeat-x" にすることで横方向のみ繰り返す(縦には繰り返さない)
    groundPattern = ctx.createPattern(groundImage, "repeat-x");
  }

  drawClouds(ctx, state);
  drawGround(ctx, state);
  drawMeats(ctx, state);
  drawEnemies(ctx, state);
  drawPlayer(ctx, state);
  drawDefeatedEnemies(ctx, state);
}

// 地面
function drawGround(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!groundPattern) return;

  ctx.save();
  // 座標系を左にずらす → パターンが左に流れて見える
  const matrix = new DOMMatrix();
  matrix.translateSelf(-state.scrollOffset, GROUND_Y);
  groundPattern.setTransform(matrix);
  ctx.fillStyle = groundPattern;
  // ずらした分、横幅を広めに描く
  ctx.fillRect(
    0,
    GROUND_Y,
    CANVAS_WIDTH + state.scrollOffset + 100,
    groundImage.naturalHeight
  );
  ctx.restore();
}

function drawClouds(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!cloudImage.complete || cloudImage.naturalWidth === 0) return;
  for (const cloud of state.clouds) {
    ctx.drawImage(cloudImage, cloud.x, cloud.y, CLOUD_WIDTH, CLOUD_HEIGHT);
  }
}

function drawMeats(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!meatImage.complete || meatImage.naturalWidth === 0) return;
  for (const meat of state.meats) {
    ctx.drawImage(meatImage, meat.x, meat.y, MEAT_WIDTH, MEAT_HEIGHT);
  }
}

function drawEnemies(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const e of state.enemies) {
    const img = enemyImages[e.type];
    if (!img.complete || img.naturalWidth === 0) {
      ctx.fillStyle = "#a55";
      ctx.fillRect(e.x, e.y, e.width, e.height);
      continue;
    }
    ctx.drawImage(img, e.x, e.y, e.width, e.height);
  }
}

function drawDefeatedEnemies(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const d of state.defeatedEnemies) {
    const img = enemyImages[d.type];
    ctx.save();
    ctx.translate(d.x + d.width / 2, d.y + d.height / 2);
    ctx.rotate(d.rotation);
    if (!img.complete || img.naturalWidth === 0) {
      ctx.fillStyle = "#a55";
      ctx.fillRect(-d.width / 2, -d.height / 2, d.width, d.height);
    } else {
      ctx.drawImage(img, -d.width / 2, -d.height / 2, d.width, d.height);
    }
    ctx.restore();
  }
}

// プレイヤー(犬) - サイズステージごとの run1/run2 画像を交互に切り替え
function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { player } = state;
  const drawX = player.x - player.width / 2;
  const drawY = player.y - player.height;

  const currentFrame = getDogFrame(player.sizeStage, state.runFrame);

  // 画像がまだロードできていない場合はフォールバック(矩形)
  if (!currentFrame.complete || currentFrame.naturalWidth === 0) {
    ctx.fillStyle = "#c9853f";
    ctx.fillRect(drawX, drawY, player.width, player.height);
    return;
  }

  ctx.drawImage(currentFrame, drawX, drawY, player.width, player.height);
}