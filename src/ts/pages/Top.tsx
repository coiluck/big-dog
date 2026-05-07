import { useState } from "react";
import { Link } from "react-router-dom";
import "../../css/top.css";

export default function Top() {
  const [isRuleOpen, setIsRuleOpen] = useState(false);

  return (
    <div>
      <div className="top-bg sky" />
      <div className="top-bg ground" />

      <div className="top-content">
        <h1 className="top-title" aria-label="巨大な犬、きょだいぬ">
          <span className="top-title-main">巨大な犬、</span>
          <span className="top-title-sub" aria-hidden="true">
            <span style={{ animationDelay: "0.55s" }}>き</span>
            <span style={{ animationDelay: "0.65s" }}>ょ</span>
            <span style={{ animationDelay: "0.75s" }}>だ</span>
            <span style={{ animationDelay: "0.85s" }}>い</span>
            <span style={{ animationDelay: "0.95s" }}>ぬ</span>
          </span>
        </h1>

        <div
          className="top-rule-button"
          onClick={() => setIsRuleOpen(true)}>
          <div className="top-rule-button-icon">📜</div>
          <p className="top-rule-button-text">ルール</p>
        </div>

        <div className="top-start-button">
          <Link to="/game">ゲーム開始！</Link>
        </div>
      </div>

      <Link to="/record" className="top-record-button">
        <div className="top-record-button-image" />
        <p className="top-record-button-text">記録</p>
      </Link>

      {isRuleOpen && <div className="rule-modal">
        <div className="rule-modal-content">
          <h2>Rule</h2>
          <p>1. ゲームは100ポイントを目標にしています。</p>
          <p>2. ゲームは10秒間です。</p>
          <p>3. ゲームは100ポイントを目標にしています。</p>
        </div>
        <div onClick={() => setIsRuleOpen(false)}>Close</div>
      </div>}
    </div>
  );
}