import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadRecords, type RunRecord } from "../lib/records";
import "../../css/record.css";

const RANK_COUNT = 10;

function RankItem({ rank, value }: { rank: number; value: string | null }) {
  return (
    <div className="record-rank-item">
      <span className="record-rank-item-rank">{rank}</span>
      <span className="record-rank-item-value">{value ?? "--"}</span>
    </div>
  );
}

export default function Record() {
  const [topDistances, setTopDistances] = useState<(RunRecord | null)[]>([]);
  const [topScores, setTopScores] = useState<(RunRecord | null)[]>([]);
  const [pageMode, setPageMode] = useState<"distance" | "score">("distance");

  useEffect(() => {
    const records = loadRecords();

    const pad = (arr: RunRecord[]): (RunRecord | null)[] => {
      const padded: (RunRecord | null)[] = [...arr];
      while (padded.length < RANK_COUNT) padded.push(null);
      return padded;
    };

    setTopDistances(pad([...records].sort((a, b) => b.distance - a.distance).slice(0, RANK_COUNT)));
    setTopScores(pad([...records].sort((a, b) => b.score - a.score).slice(0, RANK_COUNT)));
  }, []);

  const records = pageMode === "distance" ? topDistances : topScores;
  const getValue = (record: RunRecord | null) => {
    if (record === null) return null;
    return pageMode === "distance" ? String(record.distance) : String(record.score);
  };

  const left = records.slice(0, 5);   // 1〜5位
  const right = records.slice(5, 10); // 6〜10位

  return (
    <div>
      <div className="top-bg sky" />
      <div className="top-bg ground" />

      <div className="record-content">
        <div className="record-content-header">
          <Link to="/" className="record-content-header-top-container">
            <div className="record-content-header-top-button" />
          </Link>
          <span>きろく</span>
        </div>

        <div className="record-content-body">
          <div className="record-content-body-tabs-change">
            <div
              className={`record-content-body-tabs-change-item${pageMode === "distance" ? " active" : ""}`}
              onClick={() => setPageMode("distance")}>
              <span>距離</span>
            </div>
            <div
              className={`record-content-body-tabs-change-item${pageMode === "score" ? " active" : ""}`}
              onClick={() => setPageMode("score")}>
              <span>スコア</span>
            </div>
          </div>

          <div className="record-content-body-tabs-content">
            <div className="record-rank-column">
              {left.map((record, i) => (
                <RankItem key={i} rank={i + 1} value={getValue(record)} />
              ))}
            </div>
            <div className="record-rank-divider" />
            <div className="record-rank-column">
              {right.map((record, i) => (
                <RankItem key={i + 5} rank={i + 6} value={getValue(record)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}