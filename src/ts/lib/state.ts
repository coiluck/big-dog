import {
  CANVAS_WIDTH,
  CLOUD_WIDTH,
  GROUND_Y,
  INITIAL_SPEED,
  MEAT_HEIGHT,
  MEAT_WIDTH,
  PLAYER_BASE_HEIGHT,
  PLAYER_BASE_WIDTH,
  PLAYER_X,
} from "./constants";
import { useGameStore } from "./zustand";

// ============================================================
// 型定義
// ============================================================
export type SizeStage = "small" | "medium" | "giant";

export interface Meat {
  x: number;
  y: number;
}

export interface Cloud {
  x: number;
  y: number;
}

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
  distance: number;    // 累計走行距離(スコア用)
  scrollOffset: number; // 背景描画用のオフセット(0〜100でループ)
  elapsedMs: number;
  isGameOver: boolean;
  runFrame: number;    // 0 〜 1 の周期値
  meats: Meat[];
  clouds: Cloud[];
  meatSpawnTimer: number; // 次の肉スポーンまでの残り時間(ms)
  cloudSpawnTimer: number; // 次の雲スポーンまでの残り時間(ms)
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
    distance: 0,
    scrollOffset: 0,
    elapsedMs: 0,
    isGameOver: false,
    runFrame: 0,
    meats: [],
    clouds: [],
    meatSpawnTimer: 3000,
    cloudSpawnTimer: 1500,
  };
}

// distance の Zustand 同期を間引くためのモジュール変数
let distanceSyncAcc = 0;

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

  // distance を Zustand へ 100ms ごとに同期
  distanceSyncAcc += dt;
  if (distanceSyncAcc >= 100) {
    distanceSyncAcc = 0;
    useGameStore.getState().setDistance(Math.floor(state.distance));
  }

  // 走行アニメーションフレームを進める
  // (1秒で2周期くらい、スピードが上がると速くなる)
  state.runFrame = (state.runFrame + dt * 0.004 * state.speed) % 1;

  // TODO: ここに後で追加
  // - ジャンプ処理(重力適用)
  // - 障害物の更新
  // - 衝突判定
  // - 巨大化タイマー減衰

  // 肉の移動・衝突判定・スポーン・削除
  for (const meat of state.meats) {
    meat.x -= moveAmount;
  }
  state.meats = state.meats.filter((m) => m.x > -MEAT_WIDTH);
  handleMeatCollision(state);
  state.meatSpawnTimer -= dt;
  if (state.meatSpawnTimer <= 0) {
    state.meats.push({ x: CANVAS_WIDTH + 50, y: GROUND_Y - MEAT_HEIGHT });
    state.meatSpawnTimer = 4000 + Math.random() * 4000;
  }

  // 雲の移動・スポーン・削除(視差のため0.4倍速)
  for (const cloud of state.clouds) {
    cloud.x -= moveAmount * 0.4;
  }
  state.clouds = state.clouds.filter((c) => c.x > -CLOUD_WIDTH);
  state.cloudSpawnTimer -= dt;
  if (state.cloudSpawnTimer <= 0) {
    state.clouds.push({
      x: CANVAS_WIDTH + 50,
      y: 30 + Math.random() * 150, // 上部 1 / 3 のどこか
    });
    state.cloudSpawnTimer = 3000 + Math.random() * 4000;
  }
}

// 肉との衝突判定(hunger+6, score+10, 肉を削除)
function handleMeatCollision(state: GameState): void {
  const { player } = state;
  const w = PLAYER_BASE_WIDTH * player.scale;
  const h = PLAYER_BASE_HEIGHT * player.scale;
  const pLeft = player.x - w / 2;
  const pRight = player.x + w / 2;
  const pTop = player.y - h;
  const pBottom = player.y;

  const { addHunger, addScore } = useGameStore.getState();
  const remaining: Meat[] = [];
  for (const meat of state.meats) {
    const hit =
      pLeft < meat.x + MEAT_WIDTH &&
      pRight > meat.x &&
      pTop < meat.y + MEAT_HEIGHT &&
      pBottom > meat.y;
    if (hit) {
      addHunger(6);
      addScore(10);
    } else {
      remaining.push(meat);
    }
  }
  state.meats = remaining;
}

