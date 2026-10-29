import { useSyncExternalStore } from "react";
import { borrowers as sample, type Borrower } from "./cashgraph";

// Browser-only pilot store: uploaded portfolio + analyst decisions (localStorage).
export type Decision = {
  borrowerId: string;
  action: "review" | "monitor" | "dismiss";
  note: string;
  outcome: "pending" | "delinquent" | "recovered" | "false_alarm";
  at: string;
};

type State = { uploaded: Borrower[] | null; decisions: Record<string, Decision[]> };
const KEY = "cashgraph:v1";
let state: State = { uploaded: null, decisions: {} };
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {
    /* ignore */
  }
}
function set(next: State) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  subs.forEach((f) => f());
}
const SERVER: State = { uploaded: null, decisions: {} };

export function usePortfolio() {
  const s = useSyncExternalStore(
    (f) => {
      load();
      subs.add(f);
      f();
      return () => subs.delete(f);
    },
    () => (loaded ? state : SERVER),
    () => SERVER,
  );
  return {
    borrowers: s.uploaded ?? sample,
    isSample: !s.uploaded,
    decisions: s.decisions,
  };
}

export const portfolio = {
  upload: (b: Borrower[]) => set({ ...state, uploaded: b }),
  reset: () => set({ uploaded: null, decisions: {} }),
  addDecision: (d: Decision) =>
    set({ ...state, decisions: { ...state.decisions, [d.borrowerId]: [d, ...(state.decisions[d.borrowerId] ?? [])] } }),
  setOutcome: (id: string, i: number, outcome: Decision["outcome"]) => {
    const list = [...(state.decisions[id] ?? [])];
    list[i] = { ...list[i]!, outcome };
    set({ ...state, decisions: { ...state.decisions, [id]: list } });
  },
};
