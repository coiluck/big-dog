// 画面
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GROUND_Y = 480; // 地面のY座標(犬の足が乗る位置)

// プレイヤー(犬)
export const PLAYER_X = 160;        // プレイヤーの固定X座標(横スクロールなので動かない)
export const PLAYER_BASE_WIDTH = 80;
export const PLAYER_BASE_HEIGHT = 65;

// 物理
export const GRAVITY = 0.8;          // 1フレームあたりの落下加速度(px)
export const JUMP_VELOCITY = -15;    // ジャンプ初速(負=上方向)

// スピード
export const INITIAL_SPEED = 5;      // 初期スクロール速度(px/frame)
export const MAX_SPEED = 7.5;         // 最大スクロール速度(px/frame)
export const SPEED_INCREASE_RATE = 0.005; // スピード上昇率(px/frame)

// サイズ
export const SIZE_THRESHOLDS = {
  SMALL: 1.0,
  MEDIUM: 1.5,
  GIANT: 3.0,
} as const;

export const GIANT_DURATION_MS = 10000; // 巨大化の持続時間