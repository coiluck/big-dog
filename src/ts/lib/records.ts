const STORAGE_KEY = "big_dog_records";
const TOP_N = 10;

export interface RunRecord {
  distance: number;
  score: number;
}

export function loadRecords(): RunRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is RunRecord =>
        r != null &&
        typeof r === "object" &&
        typeof r.distance === "number" &&
        typeof r.score === "number"
    );
  } catch {
    return [];
  }
}

function saveRecords(records: RunRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 容量超過などは無視
  }
}

// 距離トップ10 / スコアトップ10 のいずれかに入るレコードのみ残す
export function maybeSaveRecord(current: RunRecord): void {
  const all = [...loadRecords(), current];
  const topByDistance = [...all].sort((a, b) => b.distance - a.distance).slice(0, TOP_N);
  const topByScore = [...all].sort((a, b) => b.score - a.score).slice(0, TOP_N);
  const kept = Array.from(new Set<RunRecord>([...topByDistance, ...topByScore]));
  saveRecords(kept);
}
