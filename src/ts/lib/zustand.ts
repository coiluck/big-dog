// lib/zustand.ts
import { create } from "zustand";

interface GameStore {
  hunger: number;       // 満腹度(0〜100)
  baseScore: number;
  isGameOver: boolean;
  setHunger: (v: number) => void;
  addHunger: (delta: number) => void;
  setScore: (v: number) => void;
  addScore: (delta: number) => void;
  gameOver: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  hunger: 50,
  baseScore: 0,
  isGameOver: false,
  setHunger: (v) => set({ hunger: Math.max(0, Math.min(100, v)) }),
  addHunger: (delta) => set((s) => ({ hunger: Math.max(0, Math.min(100, s.hunger + delta)) })),
  setScore: (v) => set({ baseScore: v }),
  addScore: (delta) => set((s) => ({ baseScore: s.baseScore + delta })),
  gameOver: () => set({ isGameOver: true }),
  reset: () => set({ hunger: 50, baseScore: 0, isGameOver: false }),
}));