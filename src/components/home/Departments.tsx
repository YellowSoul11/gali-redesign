import { useEffect, useRef, useState } from 'react';
import { departments, campaign } from '../../data/catalog';
import { Icon } from '../ui/Icon';

/** Typographic department index. Desktop: image follows the pointer with a lerped lag. */
export function Departments() {
  const [active, setActive] = useState<string | null>(null);
  const follower = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || !list.current || !follower.current) return;
    const el = follower.current;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, running = false;
    const tick = () => {
      x += (tx - x) * (reduce ? 1 : 0.16);
      y += (ty - y) * (reduce ? 1 : 0.16);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.3) raf = requestAnimationFrame(tick); else running = false;
    };
    const move = (e: PointerEvent) => {
      const r = list.current!.getBoundingClientRect();
      tx = e.clientX - r.left - el.offsetWidth / 2;
      ty = e.clientY - r.top - el.offsetHeight / 2;
      if (!running) { running = true; raf = requestAnimationFrame(tick); }
    };
    const enter = (e: PointerEvent) => { move(e); x = tx; y = ty; };
    const ul = list.current;
    ul.addEventListener('pointermove', move);
    ul.addEventListener('pointerenter', enter);
    return () => { ul.removeEventListener('pointermove', move); ul.removeEventListener('pointerenter', enter); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section aria-labelledby="dept-title" className="bg-ink text-paper py-20 lg:py-28">
      <div className="shell">
        <h2 id="dept-title" className="h-section mb-10 lg:mb-14">מה מחפשים היום?</h2>

        <div ref={list} className="relative" onPointerLeave={() => setActive(null)}>
        <ul className="dept-list border-t border-paper/20">
          {departments.map((d) => (
            <li key={d.id} className="border-b border-paper/20" onPointerEnter={() => setActive(d.id)}>
              <a href={d.href} className={`dept-row group grid grid-cols-[1fr_auto] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_auto] items-center gap-x-6 py-5 lg:py-7 transition-opacity duration-200 ${active && active !== d.id ? 'lg:opacity-35' : ''}`}
                onFocus={() => setActive(d.id)} onBlur={() => setActive(null)}>
                <span className="flex items-center gap-4">
                  <img src={campaign(d.image, 960)} alt="" loading="lazy" className="lg:hidden size-[72px] object-cover shrink-0" />
                  <span className="display text-[clamp(3rem,1.5rem+5.5vw,6rem)] leading-[0.95]">{d.label}</span>
                </span>
                <span className="hidden lg:block text-[15px] text-paper/70 leading-relaxed">{d.sub.slice(0, 6).join(' · ')}</span>
                <span className="grid place-items-center size-12 lg:size-14 rounded-full border border-paper/30 transition-[background-color,border-color,color] duration-200 group-hover:bg-paper group-hover:text-ink group-hover:border-paper">
                  <Icon name="arrow" className="size-5" />
                </span>
              </a>
            </li>
          ))}
        </ul>
          <div ref={follower} aria-hidden className="dept-follower pointer-events-none absolute top-0 left-0 hidden lg:block w-[300px] aspect-[4/5] z-10">
            {departments.map((d) => (
              <img key={d.id} src={campaign(d.image, 960)} alt="" loading="lazy"
                className={`absolute inset-0 size-full object-cover dept-img ${active === d.id ? 'is-on' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
