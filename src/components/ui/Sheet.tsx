import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

/**
 * Drawer primitive used by the mini-cart, wishlist, size guide and mobile filters/sort.
 * side="end" slides from the left edge (RTL end); side="bottom" is a mobile sheet.
 * Focus is moved in, trapped, and returned to the trigger on close. Esc and scrim close it.
 */
export function Sheet({ open, onClose, title, side = 'end', children, footer, width = 'w-[min(92vw,440px)]', labelledBy }: {
  open: boolean; onClose: () => void; title: ReactNode; side?: 'end' | 'bottom'; children: ReactNode; footer?: ReactNode; width?: string; labelledBy?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const id = labelledBy || 'sheet-title';

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>('[data-autofocus], button, a, input, select')?.focus(), 30);
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key !== 'Tab' || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, [tabindex="0"]')].filter((el) => el.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    window.addEventListener('keydown', key);
    return () => { window.clearTimeout(t); window.removeEventListener('keydown', key); root.style.overflow = prev; returnTo.current?.focus?.(); };
  }, [open, onClose]);

  return createPortal(
    <div className={`sheet fixed inset-0 z-[70] overflow-hidden ${open ? 'is-open' : ''} sheet-${side}`} aria-hidden={!open} inert={!open}>
      <div className="sheet-scrim absolute inset-0 bg-ink/40" onClick={onClose} />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={id}
        className={`sheet-panel absolute bg-paper flex flex-col ${side === 'end' ? `inset-y-0 left-0 ${width}` : 'inset-x-0 bottom-0 max-h-[88svh] rounded-t-[14px]'}`}>
        {side === 'bottom' && <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line shrink-0" />}
        <div className="flex items-center justify-between h-16 px-5 border-b border-line shrink-0">
          <h2 id={id} className="text-lg font-bold">{title}</h2>
          <button className="icon-btn -me-2" aria-label="סגירה" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-line p-5 pb-[max(20px,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
