import {
  GROUND_Y,
  INITIAL_SPEED,
  PLAYER_X,
} from "./constants";

// ============================================================
// 型定義
// ============================================================
export type SizeStage = "small" | "medium" | "giant";

export interface Player {
  x: number;
  y: number;          // 足元のY座標(地面に立っているとき = GROUND_Y)
  vy: number;         // 縦方向の速度
  scale: number;      // 1.0 が基準
  isCrouching: boolean;
  giantTimer: number; // 巨大化残り時間(ms)
}

export interface GameState {
  player: Player;
  speed: number;       // 現在のスクロール速度
  score: number;       // スコア
  distance: number;    // 累計走行距離(スコア用)
  scrollOffset: number; // 背景描画用のオフセット(0〜100でループ)
  elapsedMs: number;
  isGameOver: boolean;
  // 走行アニメーション用(脚の動きなどに使う)
  runFrame: number;    // 0 〜 1 の周期値
}

// ============================================================
// 初期化
// ============================================================
export function createInitialState(): GameState {
  return {
    player: {
      x: PLAYER_X,
      y: GROUND_Y,
      vy: 0,
      scale: 1.0,
      isCrouching: false,
      giantTimer: 0,
    },
    speed: INITIAL_SPEED,
    score: 0,
    distance: 0,
    scrollOffset: 0,
    elapsedMs: 0,
    isGameOver: false,
    runFrame: 0,
  };
}

// ============================================================
// 更新ロジック(毎フレーム呼ばれる)
// dt: 前フレームからの経過時間(ms)
// ============================================================
export function updateState(state: GameState, dt: number): void {
  if (state.isGameOver) return;

  state.elapsedMs += dt;

  // スクロール処理(距離 = 速度 × 時間 で計算)
  // 60FPSを基準に、dtに応じた距離を進める
  const moveAmount = state.speed * (dt / (1000 / 60));
  state.distance += moveAmount;
  state.scrollOffset = (state.scrollOffset + moveAmount) % 100;

  // 走行アニメーションフレームを進める
  // (1秒で2周期くらい、スピードが上がると速くなる)
  state.runFrame = (state.runFrame + dt * 0.004 * state.speed) % 1;

  // TODO: ここに後で追加
  // - ジャンプ処理(重力適用)
  // - 障害物の更新
  // - 衝突判定
  // - 巨大化タイマー減衰
}

// ============================================================
// HUD表示用のスナップショット作成
// ============================================================
export interface HUDSnapshot {
  distance: number;
  score: number;
}

export function createHUDSnapshot(state: GameState): HUDSnapshot {
  return {
    distance: Math.floor(state.distance),
    score: state.score,
  };
}