import { useGameStore } from "../lib/zustand";
import "../../css/hunger.css";

export default function Hunger() {
  const hunger = useGameStore((s) => s.hunger);
  return (
    <div className="hunger-component-container">
      <div>満腹度: {hunger.toFixed(0)}</div>
    </div>
  );
}