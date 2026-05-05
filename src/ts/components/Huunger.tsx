import { useGameStore } from "../lib/zustand";

export default function Hunger() {
  const hunger = useGameStore((s) => s.hunger);
  return (
    <div>
      <h2>満腹度</h2>
      <div>満腹度: {hunger.toFixed(0)}</div>
    </div>
  );
}