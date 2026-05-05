import { useCallback, useEffect, useRef, useState } from "react";
import Canvas from "../components/Canvas";
import {
  createHUDSnapshot,
  createInitialState,
  updateState,
  type HUDSnapshot,
} from "../lib/state.ts";

export default function Game() {
  // ゲーム状態はrefで管理(再レンダリングを発生させない)
  const stateRef = useRef(createInitialState());

  // HUD表示用のstateだけReactで管理(間引いて更新)
  const [hud, setHud] = useState<HUDSnapshot>(() =>
    createHUDSnapshot(stateRef.current)
  );

  // HUD更新を間引くためのカウンタ
  const hudUpdateAccRef = useRef(0);

  // 毎フレーム呼ばれる更新処理
  const onTick = useCallback((dt: number) => {
    updateState(stateRef.current, dt);

    // HUDは100msごとに更新(60FPS全部更新するとReactが重い)
    hudUpdateAccRef.current += dt;
    if (hudUpdateAccRef.current >= 100) {
      hudUpdateAccRef.current = 0;
      setHud(createHUDSnapshot(stateRef.current));
    }
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>巨大化ランゲーム</h2>
      <div style={styles.canvasWrap}>
        <Canvas stateRef={stateRef} onTick={onTick} />
        {/* HUDはCanvasの上に重ねる */}
        <div style={styles.hud}>
          <div>DISTANCE: {hud.distance}</div>
          <div>SCORE: {hud.score}</div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
  },
  title: {
    margin: "0 0 12px",
  },
  canvasWrap: {
    position: "relative",
    border: "2px solid #333",
  },
  hud: {
    position: "absolute",
    top: 12,
    left: 12,
    color: "#fff",
    fontFamily: "monospace",
    fontSize: 20,
    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
    pointerEvents: "none",
  },
};