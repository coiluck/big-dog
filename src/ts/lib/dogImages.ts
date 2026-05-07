import { PLAYER_HEIGHT_GIANT, PLAYER_HEIGHT_MEDIUM, PLAYER_HEIGHT_SMALL } from "./constants";
import type { SizeStage } from "./state";

function loadImage(path: string): HTMLImageElement {
  const img = new Image();
  img.src = `${import.meta.env.BASE_URL}${path}`;
  return img;
}

const dogFrames: Record<SizeStage, [HTMLImageElement, HTMLImageElement]> = {
  small: [
    loadImage("images/Game/dog/sm_run1.png"),
    loadImage("images/Game/dog/sm_run2.png"),
  ],
  medium: [
    loadImage("images/Game/dog/md_run1.png"),
    loadImage("images/Game/dog/md_run2.png"),
  ],
  giant: [
    loadImage("images/Game/dog/gi_run1.png"),
    loadImage("images/Game/dog/gi_run2.png"),
  ],
};

const stageHeight: Record<SizeStage, number> = {
  small: PLAYER_HEIGHT_SMALL,
  medium: PLAYER_HEIGHT_MEDIUM,
  giant: PLAYER_HEIGHT_GIANT,
};

export function getDogFrame(stage: SizeStage, runFrame: number): HTMLImageElement {
  const pair = dogFrames[stage];
  return runFrame < 0.5 ? pair[0] : pair[1];
}

// 表示サイズ:縦は constants.ts に従い、横は画像のアスペクト比から導出。
// 画像未ロード時はステージごとの仮アスペクト比を使う。
const fallbackAspect: Record<SizeStage, number> = {
  small: 1.5,
  medium: 1.0,
  giant: 0.88,
};

export function getDogDisplaySize(
  stage: SizeStage,
  runFrame: number
): { width: number; height: number } {
  const img = getDogFrame(stage, runFrame);
  const height = stageHeight[stage];
  const aspect =
    img.naturalWidth > 0 ? img.naturalWidth / img.naturalHeight : fallbackAspect[stage];
  return { width: height * aspect, height };
}
