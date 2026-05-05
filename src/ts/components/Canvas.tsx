import { useEffect, useRef } from "react";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CLOUD_HEIGHT,
  CLOUD_WIDTH,
  GROUND_Y,
  MEAT_HEIGHT,
  MEAT_WIDTH,
  PLAYER_BASE_HEIGHT,
  PLAYER_BASE_WIDTH,
} from "../lib/constants";
import type { GameState } from "../lib/state";

// ============================================================
// 画像ロード(モジュールスコープで一度だけ)
// ============================================================
function loadImage(path: string): HTMLImageElement {
  const img = new Image();
  img.src = `${import.meta.env.BASE_URL}${path}`;
  return img;
}

const groundImage = loadImage("images/Game/ground.png");
const dogRun1 = loadImage("images/Game/run1.png");
const dogRun2 = loadImage("images/Game/run2.png");
const meatImage = loadImage("images/Game/meat.png");
const cloudImage = loadImage("images/Game/cloud.png");

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
  drawPlayer(ctx, state);
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

// プレイヤー(犬) - run1.png と run2.png を交互に切り替え
function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { player } = state;
  const w = PLAYER_BASE_WIDTH * player.scale;
  const h = PLAYER_BASE_HEIGHT * player.scale;
  const drawX = player.x - w / 2;
  const drawY = player.y - h;

  // runFrame は 0〜1 の周期値。前半をrun1、後半をrun2にする
  const currentFrame = state.runFrame < 0.5 ? dogRun1 : dogRun2;

  // 画像がまだロードできていない場合はフォールバック(矩形)
  if (!currentFrame.complete || currentFrame.naturalWidth === 0) {
    ctx.fillStyle = "#c9853f";
    ctx.fillRect(drawX, drawY, w, h);
    return;
  }

  ctx.drawImage(currentFrame, drawX, drawY, w, h);
}