import { useEffect, useState } from 'react';
import { colorTone } from '../../data/catalog';
import type { FacetKey, FacetOption } from '../../lib/filters';
import { Icon } from '../ui/Icon';

/** Checkbox list (category, brand, promotion, department) */
export function CheckList({ name, options, selected, onToggle }: { name: string; options: FacetOption[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <ul className="space-y-0.5" aria-label={name}>
      {options.map((o) => {
        const on = selected.includes(o.value);
        const off = !o.count && !on;
        return (
          <li key={o.value}>
            <label className={`check-row flex items-center gap-3 min-h-11 px-1 cursor-pointer ${off ? 'opacity-40 cursor-default' : ''}`}>
              <input type="checkbox" className="peer sr-only" checked={on} disabled={off} onChange={() => onToggle(o.value)} />
              <span aria-hidden className="check-box grid place-items-center size-5 border-[1.5px] border-ink/40 peer-checked:bg-ink peer-checked:border-ink peer-focus-visible:outline-2 peer-focus-visible:outline-gali peer-focus-visible:outline-offset-2 text-paper">
                <Icon name="check" className="size-3.5" />
              </span>
              <span className={`flex-1 text-[15px] ${o.value === 'OUTLET' || o.value === 'FINAL SALE' ? 'latin text-[13px]' : ''}`} dir={/^[A-Z0-9 &.-]+$/.test(o.label) ? 'ltr' : undefined} style={{ textAlign: 'right' }}>{o.label}</span>
              <span className="num text-[13px] text-ink-3">{o.count}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/** Size grid — real Gali sizes (EU; S–XL for accessories) */
export function SizeGrid({ options, selected, onToggle }: { options: FacetOption[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <ul className="grid grid-cols-5 gap-1.5" aria-label="מידה">
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <li key={o.value}>
            <button type="button" aria-pressed={on} disabled={!o.count && !on} onClick={() => onToggle(o.value)}
              className={`size-chip num w-full h-11 text-[14px] font-medium border transition-colors duration-150 disabled:opacity-30 disabled:line-through ${on ? 'bg-ink text-paper border-ink' : 'border-ink/20 hover:border-ink'}`}>
              {o.value}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ColorList({ options, selected, onToggle }: { options: FacetOption[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3" aria-label="צבע">
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <li key={o.value}>
            <button type="button" aria-pressed={on} disabled={!o.count && !on} onClick={() => onToggle(o.value)}
              className="flex w-full items-center gap-2.5 min-h-11 text-[15px] disabled:opacity-40">
              <span className={`size-6 rounded-full ring-1 ring-ink/15 ring-offset-2 ring-offset-paper transition-shadow ${on ? '!ring-2 !ring-ink' : ''}`} style={{ background: colorTone(o.value) }} />
              <span className="flex-1 text-start">{o.label}</span>
              <span className="num text-[13px] text-ink-3">{o.count}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Two-thumb price range (Gali uses a min/max slider). Commits on release / blur. */
export function PriceRange({ lo, hi, min, max, onChange }: { lo: number; hi: number; min?: number; max?: number; onChange: (min?: number, max?: number) => void }) {
  const [a, setA] = useState(min ?? lo);
  const [b, setB] = useState(max ?? hi);
  useEffect(() => { setA(min ?? lo); setB(max ?? hi); }, [min, max, lo, hi]);
  const commit = (x = a, y = b) => onChange(x <= lo ? undefined : x, y >= hi ? undefined : y);
  const pct = (v: number) => ((v - lo) / Math.max(1, hi - lo)) * 100;
  return (
    <div className="pt-2">
      <div className="relative h-8" dir="ltr">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-line" />
        <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-ink" style={{ left: `${pct(a)}%`, right: `${100 - pct(b)}%` }} />
        <input type="range" aria-label="מחיר מינימלי" min={lo} max={hi} value={a} className="range-thumb absolute inset-0 w-full"
          onChange={(e) => setA(Math.min(Number(e.target.value), b - 1))} onPointerUp={() => commit()} onKeyUp={() => commit()} onBlur={() => commit()} />
        <input type="range" aria-label="מחיר מקסימלי" min={lo} max={hi} value={b} className="range-thumb absolute inset-0 w-full"
          onChange={(e) => setB(Math.max(Number(e.target.value), a + 1))} onPointerUp={() => commit()} onKeyUp={() => commit()} onBlur={() => commit()} />
      </div>
      {/* labels sit under their thumbs (slider runs low→high, left→right) */}
      <div className="mt-3 flex items-center justify-between text-[14px]" dir="ltr">
        <span className="num">₪{a}</span>
        <span className="num">₪{b}</span>
      </div>
    </div>
  );
}

export type FacetRender = { key: FacetKey | 'price'; label: string; count: number };
