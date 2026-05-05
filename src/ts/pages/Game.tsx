import { useCallback, useEffect, useRef } from "react";
import Canvas from "../components/Canvas";
import { createInitialState, jumpPlayer, updateState } from "../lib/state.ts";
import Score from "../components/Score";
import Hunger from "../components/Hunger";
import "../../css/game.css";

export default function Game() {
  // ゲーム状態はrefで管理(再レンダリングを発生させない)
  const stateRef = useRef(createInitialState());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jumpPlayer(stateRef.current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 毎フレーム呼ばれる更新処理
  const onTick = useCallback((dt: number) => {
    updateState(stateRef.current, dt);
  }, []);

  return (
    <div className="game-container">
      <Canvas stateRef={stateRef} onTick={onTick} />
      <Score />
      <Hunger />
    </div>
  );
}