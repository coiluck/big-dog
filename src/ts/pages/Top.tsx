import { useState } from "react";
import { Link } from "react-router-dom";
import "../../css/top.css";
import Rule from "../components/Rule";

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

      {isRuleOpen && <Rule setIsRuleOpen={setIsRuleOpen} />}
    </div>
  );
}