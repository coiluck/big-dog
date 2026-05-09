import { Link } from "react-router-dom";
import { useGameStore } from "../lib/zustand";
import "../../css/gameOver.css";

interface Props {
  onRestart: () => void;
}

export default function GameOver({ onRestart }: Props) {
  const isGameOver = useGameStore((s) => s.isGameOver);
  const distance = useGameStore((s) => s.distance);
  const score = useGameStore((s) => s.baseScore);

  if (!isGameOver) return null;

  const handleBackToTop = () => {
    useGameStore.getState().reset();
  };

  return (
    <div className="game-over-modal">
      <div className="game-over-overlay" />
      <div className="game-over-content">
        <h2 className="game-over-title">GAME OVER</h2>
        <div className="game-over-stats">
          <div className="game-over-stat-row">
            <span className="game-over-stat-label">DISTANCE</span>
            <span className="game-over-stat-value">{(distance / 10).toFixed(0)}</span>
          </div>
          <div className="game-over-stat-row">
            <span className="game-over-stat-label">SCORE</span>
            <span className="game-over-stat-value">{score}</span>
          </div>
        </div>
        <div className="game-over-buttons">
          <button className="game-over-button retry" onClick={onRestart}>
            再チャレンジ
          </button>
          <Link to="/" className="game-over-button top" onClick={handleBackToTop}>
            Topへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
