// 画面
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GROUND_Y = 480; // 地面のY座標(犬の足が乗る位置)

// プレイヤー(犬)
export const PLAYER_X = 160;        // プレイヤーの固定X座標(横スクロールなので動かない)
export const PLAYER_BASE_WIDTH = 80;
export const PLAYER_BASE_HEIGHT = 65;

// 物理
export const GRAVITY = 1;          // 1フレームあたりの落下加速度(px)
export const JUMP_VELOCITY = -18;    // ジャンプ初速(負=上方向)

// スピード
export const INITIAL_SPEED = 6;      // 初期スクロール速度(px/frame)
export const MAX_SPEED = 10;         // 最大スクロール速度(px/frame)
export const SPEED_INCREASE_RATE = 0.0005; // スピード上昇率(px/frame)

// サイズ
export const SIZE_THRESHOLDS = {
  SMALL: 1.0,
  MEDIUM: 2,
  GIANT: 3.0,
} as const;

export const GIANT_DURATION_MS = 10000; // 巨大化の持続時間

// オブジェクトサイズ
export const MEAT_WIDTH = 60;
export const MEAT_HEIGHT = 32;
export const CLOUD_WIDTH = 106;
export const CLOUD_HEIGHT = 63;