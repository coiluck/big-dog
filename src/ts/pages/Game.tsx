import { useCallback, useRef } from "react";
import Canvas from "../components/Canvas";
import { createInitialState, updateState, } from "../lib/state.ts";
import Score from "../components/Score";
import Hunger from "../components/Hunger";
import "../../css/game.css";

export default function Game() {
  // ゲーム状態はrefで管理(再レンダリングを発生させない)
  const stateRef = useRef(createInitialState());

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