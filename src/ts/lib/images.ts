// lib/images.ts
import type { EnemyType } from "./state";

function loadImage(path: string): HTMLImageElement {
  const img = new Image();
  img.src = `${import.meta.env.BASE_URL}${path}`;
  return img;
}

export const groundImage = loadImage("images/Game/ground.png");
export const meatImage = loadImage("images/Game/meat.png");
export const cloudImage = loadImage("images/Game/cloud.png");
export const enemyImages: Record<EnemyType, HTMLImageElement> = {
  bee: loadImage("images/Game/enemy/bee.png"),
  bicycle: loadImage("images/Game/enemy/bicycle.png"),
  doktor: loadImage("images/Game/enemy/doktor.png"),
  f35: loadImage("images/Game/enemy/f35.png"),
};