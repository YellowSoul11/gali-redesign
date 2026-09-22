import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../ui/Icon';

/** PDP gallery. Desktop: editorial grid (lead image full width, then pairs). Mobile: full-bleed swipe with counter. Any image opens the lightbox. */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [box, setBox] = useState<number | null>(null);
  const [idx, setIdx] = useState(0);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => { setIdx(0); track.current?.scrollTo({ left: 0 }); }, [images]);
  const onScroll = () => {
    const el = track.current; if (!el) return;
    setIdx(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };

  return (
    <>
      {/* mobile / tablet: swipe */}
      <div className="lg:hidden relative -mx-[var(--gutter)]">
        <ul ref={track} onScroll={onScroll} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar" aria-label="תמונות המוצר">
          {images.map((src, i) => (
            <li key={src} className="w-full shrink-0 snap-center">
              <button type="button" className="block w-full aspect-square bg-[#efe9df]" onClick={() => setBox(i)} aria-label={`הגדלת תמונה ${i + 1} מתוך ${images.length}`}>
                <img src={src} alt={i === 0 ? alt : ''} loading={i ? 'lazy' : 'eager'} className="size-full object-contain mix-blend-multiply" />
              </button>
            </li>
          ))}
        </ul>
        {images.length > 1 && (
          <>
            <p className="num absolute bottom-3 left-[var(--gutter)] px-2.5 h-7 grid place-items-center bg-paper/90 text-[12px] font-semibold" aria-live="polite">{idx + 1} / {images.length}</p>
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5" aria-hidden>
              {images.map((s, i) => <span key={s} className={`h-1 rounded-full bg-ink transition-[width,opacity] duration-200 ${i === idx ? 'w-5 opacity-90' : 'w-1.5 opacity-30'}`} />)}
            </div>
          </>
        )}
      </div>

      {/* desktop: editorial grid */}
      <ul className="hidden lg:grid grid-cols-2 gap-2" aria-label="תמונות המוצר">
        {images.map((src, i) => (
          <li key={src} className={i === 0 || (i === images.length - 1 && images.length % 2 === 0) ? 'col-span-2' : ''}>
            <button type="button" onClick={() => setBox(i)} aria-label={`הגדלת תמונה ${i + 1} מתוך ${images.length}`}
              className={`gallery-cell group block w-full overflow-hidden bg-[#efe9df] cursor-zoom-in ${i === 0 ? 'aspect-[4/3]' : 'aspect-square'}`}>
              <img src={src} alt={i === 0 ? alt : ''} loading={i < 3 ? 'eager' : 'lazy'} className="size-full object-contain mix-blend-multiply transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]" />
            </button>
          </li>
        ))}
      </ul>

      {box != null && <Lightbox images={images} start={box} alt={alt} onClose={() => setBox(null)} />}
    </>
  );
}

function Lightbox({ images, start, alt, onClose }: { images: string[]; start: number; alt: string; onClose: () => void }) {
  const [i, setI] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLElement | null>(null);
  const go = (d: number) => setI((x) => (x + d + images.length) % images.length);
  useEffect(() => {
    back.current = document.activeElement as HTMLElement;
    ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // RTL: the "next" image is to the left
      if (e.key === 'ArrowLeft') go(1);
      if (e.key === 'ArrowRight') go(-1);
    };
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); document.documentElement.style.overflow = prev; back.current?.focus(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return createPortal(
    <div ref={ref} role="dialog" aria-modal="true" aria-label={`${alt} – תמונה ${i + 1} מתוך ${images.length}`} className="lightbox fixed inset-0 z-[80] bg-[#efe9df] flex flex-col">
      <div className="flex items-center justify-between h-16 px-4 shrink-0">
        <p className="num text-[14px] font-semibold">{i + 1} / {images.length}</p>
        <button data-autofocus className="icon-btn" aria-label="סגירה" onClick={onClose}><Icon name="close" /></button>
      </div>
      <div className="relative flex-1 min-h-0">
        <img key={images[i]} src={images[i]} alt={alt} className="lightbox-img absolute inset-0 m-auto max-h-full max-w-full object-contain mix-blend-multiply" />
        {images.length > 1 && (
          <>
            <button className="icon-btn absolute right-3 top-1/2 -translate-y-1/2 bg-paper/80" aria-label="התמונה הקודמת" onClick={() => go(-1)}><Icon name="chevron" className="size-6 rotate-180" /></button>
            <button className="icon-btn absolute left-3 top-1/2 -translate-y-1/2 bg-paper/80" aria-label="התמונה הבאה" onClick={() => go(1)}><Icon name="chevron" className="size-6" /></button>
          </>
        )}
      </div>
      <ul className="flex justify-center gap-2 p-4 shrink-0 overflow-x-auto">
        {images.map((s, n) => (
          <li key={s}><button aria-label={`תמונה ${n + 1}`} aria-current={n === i} onClick={() => setI(n)}
            className={`block size-16 bg-paper/60 transition-shadow ${n === i ? 'shadow-[inset_0_0_0_2px_var(--color-ink)]' : ''}`}>
            <img src={s} alt="" className="size-full object-contain mix-blend-multiply" /></button></li>
        ))}
      </ul>
    </div>,
    document.body,
  );
}
