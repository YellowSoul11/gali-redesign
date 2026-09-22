import { useSyncExternalStore } from 'react';

// Client store for the concept: wishlist, bag and the shared drawer. No backend.
// Persisted per viewer in localStorage (wrapped: storage may be unavailable).
export interface BagLine { key: string; id: string; code: string; size: string; qty: number }
export type Drawer = null | 'bag' | 'wish';
type State = { wish: Set<string>; bag: BagLine[]; drawer: Drawer; lastAdded?: string };

const KEY = 'gali-concept-v1';
function load(): State {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { wish: new Set(raw.wish || []), bag: Array.isArray(raw.bag) ? raw.bag : [], drawer: null };
  } catch { return { wish: new Set(), bag: [], drawer: null }; }
}
let state: State = load();
const subs = new Set<() => void>();
const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  try { localStorage.setItem(KEY, JSON.stringify({ wish: [...state.wish], bag: state.bag })); } catch { /* ignore */ }
  subs.forEach((f) => f());
};

export const store = {
  toggleWish(id: string) {
    const wish = new Set(state.wish);
    if (wish.has(id)) wish.delete(id); else wish.add(id);
    set({ wish });
  },
  addToBag(id: string, code: string, size: string) {
    const key = `${id}-${code}-${size}`;
    const hit = state.bag.find((l) => l.key === key);
    const bag = hit ? state.bag.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + 1, 9) } : l)) : [...state.bag, { key, id, code, size, qty: 1 }];
    set({ bag, lastAdded: key, drawer: 'bag' });
  },
  setQty(key: string, qty: number) {
    set({ bag: qty <= 0 ? state.bag.filter((l) => l.key !== key) : state.bag.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 9) } : l)) });
  },
  remove(key: string) { set({ bag: state.bag.filter((l) => l.key !== key) }); },
  open(drawer: Drawer) { set({ drawer, lastAdded: drawer === 'bag' ? state.lastAdded : undefined }); },
  close() { set({ drawer: null, lastAdded: undefined }); },
};

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => select(state),
  );
}
export const bagCount = (s: State) => s.bag.reduce((n, l) => n + l.qty, 0);
