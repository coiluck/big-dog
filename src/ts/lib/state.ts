import {
  BEE_HEIGHT,
  BEE_WIDTH,
  BICYCLE_HEIGHT,
  BICYCLE_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CLOUD_WIDTH,
  DOKTOR_HEIGHT,
  DOKTOR_WIDTH,
  F35_HEIGHT,
  F35_WIDTH,
  GIANT_DURATION_MS,
  GIANT_SPEED,
  GIANT_SPEED_TRANSITION_DURATION_MS,
  GRAVITY,
  GROUND_Y,
  HUNGER_GIANT_MIN,
  HUNGER_MEDIUM_MIN,
  INITIAL_SPEED,
  JUMP_VELOCITY,
  MAX_SPEED,
  MEAT_HEIGHT,
  MEAT_WIDTH,
  PLAYER_HEIGHT_SMALL,
  PLAYER_X,
  SPEED_INCREASE_RATE,
  BEE_BOB_AMPLITUDE,
  BEE_BOB_FREQUENCY,
  BICYCLE_SELF_SPEED_MAX,
  BICYCLE_SELF_SPEED_MIN,
  F35_SELF_SPEED_MAX,
  F35_SELF_SPEED_MIN,
} from "./constants";
import { getDogDisplaySize, getDogFrame } from "./dogImages";
import { pixelOverlap } from "./pixelMask";
import { enemyImages, meatImage } from "./images";
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

export type EnemyType = "bee" | "bicycle" | "doktor" | "f35";

const ENEMY_DIMS: Record<EnemyType, { width: number; height: number }> = {
  bee: { width: BEE_WIDTH, height: BEE_HEIGHT },
  bicycle: { width: BICYCLE_WIDTH, height: BICYCLE_HEIGHT },
  doktor: { width: DOKTOR_WIDTH, height: DOKTOR_HEIGHT },
  f35: { width: F35_WIDTH, height: F35_HEIGHT },
};

// 空中にも出現する敵(false=地上のみ)
const ENEMY_AIR_CAPABLE: Record<EnemyType, boolean> = {
  bee: true,
  bicycle: false,
  doktor: false,
  f35: true,
};

function isKillable(type: EnemyType, stage: SizeStage): boolean {
  if (stage === "giant") return true;
  if (stage === "medium") return type === "bee" || type === "bicycle";
  return false;
}

export interface Enemy {
  type: EnemyType;
  x: number;          // 左上座標
  y: number;          // 左上座標(現在位置)
  width: number;
  height: number;
  baseY?: number;     // bee用:サイン波の中心y座標
  phase?: number;     // bee用:サイン波の位相(ms)
  selfSpeed?: number; // f35, bicycle用:自身の追加左方向速度(px/frame@60fps基準)
}

export interface DefeatedEnemy {
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  rotation: number;       // ラジアン
  rotationSpeed: number;  // ラジアン/フレーム(60fps基準)
}

export interface Player {
  x: number;
  y: number;          // 足元のY座標(地面に立っているとき = GROUND_Y)
  vy: number;         // 縦方向の速度
  jumpsUsed: number;  // 使用済みジャンプ回数(0=地上, 最大2)
  sizeStage: SizeStage;
  width: number;      // 表示・当たり判定の横幅(画像のアスペクト比から算出)
  height: number;     // 表示・当たり判定の高さ(ステージごとに固定)
  isCrouching: boolean;
  giantTimer: number; // 巨大化残り時間(ms)
}

export function computeSizeStage(hunger: number): SizeStage {
  if (hunger >= HUNGER_GIANT_MIN) return "giant";
  if (hunger >= HUNGER_MEDIUM_MIN) return "medium";
  return "small";
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
  enemies: Enemy[];
  defeatedEnemies: DefeatedEnemy[];
  meatSpawnTimer: number; // 次の肉スポーンまでの残り時間(ms)
  cloudSpawnTimer: number; // 次の雲スポーンまでの残り時間(ms)
  enemySpawnTimer: number; // 次の敵スポーンまでの残り時間(ms)
  giantStartSpeed: number; // 巨大化開始時のスクロール速度(ramp-up用)
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
      jumpsUsed: 0,
      sizeStage: "small",
      width: PLAYER_HEIGHT_SMALL * 1.5, // 初期仮値、最初の updateState で正しい値に上書き
      height: PLAYER_HEIGHT_SMALL,
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
    enemies: [],
    defeatedEnemies: [],
    meatSpawnTimer: 3000,
    cloudSpawnTimer: 1500,
    enemySpawnTimer: 2000,
    giantStartSpeed: 0,
  };
}

// distance の Zustand 同期を間引くためのモジュール変数
let distanceSyncAcc = 0;
// 巨大化残り時間の Zustand 同期を間引くためのモジュール変数
let giantSyncAcc = 0;

// ============================================================
// 更新ロジック(毎フレーム呼ばれる)
// dt: 前フレームからの経過時間(ms)
// ============================================================
export function updateState(state: GameState, dt: number): void {
  if (state.isGameOver) return;

  state.elapsedMs += dt;

  // 巨大化トリガー: 満腹度が100に達し、まだ巨大化中でないとき
  const currentHunger = useGameStore.getState().hunger;
  if (currentHunger >= HUNGER_GIANT_MIN && state.player.giantTimer <= 0) {
    state.player.giantTimer = GIANT_DURATION_MS;
    state.giantStartSpeed = state.speed;
    useGameStore.getState().setGiantRemainingMs(GIANT_DURATION_MS);
    giantSyncAcc = 0;
  }

  // スクロール速度の更新(巨大化中はGIANT_SPEEDにランプ、通常時は徐々に上昇)
  if (state.player.giantTimer > 0) {
    state.player.giantTimer = Math.max(0, state.player.giantTimer - dt);
    const transition = GIANT_SPEED_TRANSITION_DURATION_MS;
    const elapsed = GIANT_DURATION_MS - state.player.giantTimer;

    if (elapsed < transition) {
      // ランプアップ: 開始時の速度 → GIANT_SPEED
      const t = elapsed / transition;
      state.speed = state.giantStartSpeed + (GIANT_SPEED - state.giantStartSpeed) * t;
    } else if (state.player.giantTimer < transition) {
      // ランプダウン: GIANT_SPEED → INITIAL_SPEED
      const t = 1 - state.player.giantTimer / transition;
      state.speed = GIANT_SPEED + (INITIAL_SPEED - GIANT_SPEED) * t;
    } else {
      // ピーク
      state.speed = GIANT_SPEED;
    }

    // 残り時間を 100ms ごとに Zustand へ同期
    giantSyncAcc += dt;
    if (giantSyncAcc >= 100) {
      giantSyncAcc = 0;
      useGameStore.getState().setGiantRemainingMs(state.player.giantTimer);
    }

    // 巨大化終了: 満腹度を0に戻し、速度を初期値に
    if (state.player.giantTimer === 0) {
      useGameStore.getState().setHunger(0);
      useGameStore.getState().setGiantRemainingMs(0);
      state.speed = INITIAL_SPEED;
      giantSyncAcc = 0;
    }
  } else {
    // 通常: 60FPSを基準に、dtに応じて少しずつ速度上昇
    state.speed = Math.min(MAX_SPEED, state.speed + SPEED_INCREASE_RATE * (dt / (1000 / 60)));
  }

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
  state.runFrame = (state.runFrame + dt * 0.002 * state.speed) % 1;

  // 満腹度からサイズステージと表示寸法を更新(当たり判定もこの寸法を使う)
  const hunger = useGameStore.getState().hunger;
  state.player.sizeStage = computeSizeStage(hunger);
  const size = getDogDisplaySize(state.player.sizeStage, state.runFrame);
  state.player.width = size.width;
  state.player.height = size.height;

  // 重力・着地処理
  const { player } = state;
  const scale = dt / (1000 / 60);
  player.vy += GRAVITY * scale;
  player.y += player.vy * scale;
  if (player.y >= GROUND_Y) {
    player.y = GROUND_Y;
    player.vy = 0;
    player.jumpsUsed = 0;
  }

  // 肉の移動・衝突判定・スポーン・削除
  for (const meat of state.meats) {
    meat.x -= moveAmount;
  }
  state.meats = state.meats.filter((m) => m.x > -MEAT_WIDTH);
  handleMeatCollision(state);
  state.meatSpawnTimer -= dt;
  if (state.meatSpawnTimer <= 0) {
    const maxY = GROUND_Y - MEAT_HEIGHT;
    const minY = 180;
    const y = minY + Math.random() * (maxY - minY);
    state.meats.push({
      x: CANVAS_WIDTH + 50,
      y: y,
    });
    state.meatSpawnTimer = 2500 + Math.random() * 2500;
  }

  // 敵の移動・衝突判定・スポーン・削除
  for (const   e of state.enemies) {
    // スクロールによる移動
    e.x -= moveAmount;

    // 自身の移動(f35, bicycle)
    if (e.selfSpeed !== undefined) {
      e.x -= e.selfSpeed * scale;
    }

    // bee: 基準yの周りでサイン波運動
    if (e.type === "bee" && e.baseY !== undefined && e.phase !== undefined) {
      e.phase += dt;
      e.y = e.baseY + Math.sin(e.phase * BEE_BOB_FREQUENCY) * BEE_BOB_AMPLITUDE;
    }
  }

  state.enemies = state.enemies.filter((e) => e.x + e.width > 0);
  handleEnemyCollision(state);
  if (state.isGameOver) return;
  state.enemySpawnTimer -= dt;
  if (state.enemySpawnTimer <= 0) {
    spawnEnemy(state);
    state.enemySpawnTimer = 700 + Math.random() * 500;
  }

  // 倒した敵:スクロールに合わせて流れつつ、上に飛んで重力で落下、回転
  for (const d of state.defeatedEnemies) {
    d.x -= moveAmount;
    d.vy += GRAVITY * scale;
    d.y += d.vy * scale;
    d.rotation += d.rotationSpeed * scale;
  }
  state.defeatedEnemies = state.defeatedEnemies.filter(
    (d) => d.x + d.width > 0 && d.y < CANVAS_HEIGHT + 200
  );

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

// ジャンプ(ダブルジャンプまで対応)
export function jumpPlayer(state: GameState): void {
  if (state.player.jumpsUsed < 2) {
    state.player.vy = JUMP_VELOCITY;
    state.player.jumpsUsed++;
  }
}

// 敵スポーン:タイプをランダムに選び、空中可なら空中へ
function spawnEnemy(state: GameState): void {
  const types: EnemyType[] = ["bee", "bicycle", "doktor", "f35"];
  const type = types[Math.floor(Math.random() * types.length)];
  const { width, height } = ENEMY_DIMS[type];
  let y: number;
  if (ENEMY_AIR_CAPABLE[type]) {
    // 空中:ジャンプで届く高さ範囲
    const minTop = 200;
    const maxTop = 300;
    y = minTop + Math.random() * (maxTop - minTop);
  } else {
    // 地上:画像底辺=GROUND_Y
    y = GROUND_Y - height;
  }

  const enemy: Enemy = {
    type,
    x: CANVAS_WIDTH + 50,
    y,
    width,
    height,
  };

  // タイプ別の動きパラメータを設定
  if (type === "bee") {
    enemy.baseY = y;
    enemy.phase = Math.random() * Math.PI * 2 * 1000; // 開始位相をランダム化
  } else if (type === "f35") {
    enemy.selfSpeed =
      F35_SELF_SPEED_MIN + Math.random() * (F35_SELF_SPEED_MAX - F35_SELF_SPEED_MIN);
  } else if (type === "bicycle") {
    enemy.selfSpeed =
      BICYCLE_SELF_SPEED_MIN +
      Math.random() * (BICYCLE_SELF_SPEED_MAX - BICYCLE_SELF_SPEED_MIN);
  }

  state.enemies.push(enemy);
}

// 敵との衝突判定:倒せれば撃退アニメへ、倒せなければゲームオーバー
function handleEnemyCollision(state: GameState): void {
  const { player } = state;
  const playerImg = getDogFrame(player.sizeStage, state.runFrame);
  const playerBox = {
    x: player.x - player.width / 2,
    y: player.y - player.height,
    w: player.width,
    h: player.height,
    img: playerImg,
  };

  const remaining: Enemy[] = [];
  const { addScore, gameOver } = useGameStore.getState();
  for (const e of state.enemies) {
    const enemyBox = {
      x: e.x,
      y: e.y,
      w: e.width,
      h: e.height,
      img: enemyImages[e.type],
    };
    const hit = pixelOverlap(playerBox, enemyBox);
    if (!hit) {
      remaining.push(e);
      continue;
    }
    if (isKillable(e.type, player.sizeStage)) {
      state.defeatedEnemies.push({
        type: e.type,
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
        vy: -10,
        rotation: 0,
        rotationSpeed: (Math.random() < 0.5 ? -1 : 1) * (0.18 + Math.random() * 0.12),
      });
      addScore(50);
    } else {
      state.isGameOver = true;
      gameOver();
      console.log("Game Over!");
      remaining.push(e);
    }
  }
  state.enemies = remaining;
}

// 肉との衝突判定(hunger+7, score+10, 肉を削除)
function handleMeatCollision(state: GameState): void {
  const { player } = state;
  const playerImg = getDogFrame(player.sizeStage, state.runFrame);
  const playerBox = {
    x: player.x - player.width / 2,
    y: player.y - player.height,
    w: player.width,
    h: player.height,
    img: playerImg,
  };

  const { addHunger, addScore } = useGameStore.getState();
  const remaining: Meat[] = [];
  for (const meat of state.meats) {
    const meatBox = {
      x: meat.x,
      y: meat.y,
      w: MEAT_WIDTH,
      h: MEAT_HEIGHT,
      img: meatImage,
    };
    if (pixelOverlap(playerBox, meatBox)) {
      addHunger(8);
      addScore(10);
    } else {
      remaining.push(meat);
    }
  }
  state.meats = remaining;
}