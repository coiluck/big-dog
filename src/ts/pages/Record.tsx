import { useEffect, useState } from "react";
import { loadRecords, type RunRecord } from "../lib/records";

export default function Record() {
  const [topDistances, setTopDistances] = useState<RunRecord[]>([]);
  const [topScores, setTopScores] = useState<RunRecord[]>([]);

  useEffect(() => {
    const records = loadRecords();
    setTopDistances([...records].sort((a, b) => b.distance - a.distance).slice(0, 10));
    setTopScores([...records].sort((a, b) => b.score - a.score).slice(0, 10));
  }, []);

  return (
    <div className="page">
      <h1>Record</h1>
    </div>
  );
}
