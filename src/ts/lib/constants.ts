// 画面
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GROUND_Y = 480; // 地面のY座標(犬の足が乗る位置)

// プレイヤー(犬)
export const PLAYER_X = 160;        // プレイヤーの固定X座標(横スクロールなので動かない)
// 各ステージの表示高さ(横幅は画像のアスペクト比から算出)
export const PLAYER_HEIGHT_SMALL = 65;
export const PLAYER_HEIGHT_MEDIUM = 130;
export const PLAYER_HEIGHT_GIANT = 195;

// 満腹度→ステージのしきい値(以上で当該ステージ以上)
export const HUNGER_MEDIUM_MIN = 60;
export const HUNGER_GIANT_MIN = 100;

// 物理
export const GRAVITY = 1;          // 1フレームあたりの落下加速度(px)
export const JUMP_VELOCITY = -18;    // ジャンプ初速(負=上方向)

// スピード
export const INITIAL_SPEED = 8;      // 初期スクロール速度(px/frame)
export const MAX_SPEED = 14;         // 最大スクロール速度(px/frame)
export const SPEED_INCREASE_RATE = 0.0005; // スピード上昇率(px/frame)

export const GIANT_DURATION_MS = 10000; // 巨大化の持続時間
export const GIANT_SPEED = 35; // 巨大化時のスクロール速度
export const GIANT_SPEED_TRANSITION_DURATION_MS = 500; // 巨大化時のスクロール速度の変化時間

// オブジェクトサイズ
export const MEAT_WIDTH = 60;
export const MEAT_HEIGHT = 32;
export const CLOUD_WIDTH = 106;
export const CLOUD_HEIGHT = 63;

export const BEE_WIDTH = 49;
export const BEE_HEIGHT = 43;
export const BICYCLE_WIDTH = 95;
export const BICYCLE_HEIGHT = 59;
export const DOKTOR_WIDTH = 40;
export const DOKTOR_HEIGHT = 100;
export const F35_WIDTH = 98;
export const F35_HEIGHT = 26;

// 敵の動きパラメータ
// bee: 基準yからの上下サイン波運動
export const BEE_BOB_AMPLITUDE = 30;        // 上下振幅(px)
export const BEE_BOB_FREQUENCY = 0.003;     // 角速度(rad/ms) - 1秒で約0.95周期

// f35: 自身が左方向に進む追加速度(スクロール速度に加算)
export const F35_SELF_SPEED_MIN = 3;
export const F35_SELF_SPEED_MAX = 5;

// bicycle: 自身が左方向に進む追加速度
export const BICYCLE_SELF_SPEED_MIN = 1;
export const BICYCLE_SELF_SPEED_MAX = 3;