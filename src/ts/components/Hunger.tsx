import { useGameStore } from "../lib/zustand";
import { HUNGER_MEDIUM_MIN, HUNGER_GIANT_MIN, GIANT_DURATION_MS } from "../lib/constants";
import type { SizeStage } from "../lib/state";
import "../../css/hunger.css";

export default function Hunger() {
  const hunger = useGameStore((s) => s.hunger);
  const giantRemainingMs = useGameStore((s) => s.giantRemainingMs);
  let sizeStage: SizeStage | null = null;

  if (hunger >= HUNGER_GIANT_MIN) {
    sizeStage = "giant";
  } else if (hunger >= HUNGER_MEDIUM_MIN) {
    sizeStage = "medium";
  } else {
    sizeStage = "small";
  }

  return (
    <div className={`hunger-component-container ${sizeStage === "giant" ? "giant" : ""}`}>
      <div className={`hunger-component-icon ${sizeStage}`} />
      <div className={`hunger-component-bar ${sizeStage}`}>
        {sizeStage === "giant" &&
          <div className="hunger-component-bar-inner" style={{ width: `${giantRemainingMs / GIANT_DURATION_MS * 100}%` }} />
        }
        {sizeStage !== "giant" &&
          <div className="hunger-component-bar-inner" style={{ width: `${hunger}%` }} />
        }
      </div>
    </div>
  );
}