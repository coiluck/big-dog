import { useGameStore } from "../lib/zustand";

export default function Score() {
  const score = useGameStore((s) => s.baseScore);
  const distance = useGameStore((s) => s.distance);

  return (
    <div className="game-hud">
      <div>DISTANCE: {( distance / 10).toFixed(0)}</div>
      <div>SCORE: {score}</div>
    </div>
  );
}
