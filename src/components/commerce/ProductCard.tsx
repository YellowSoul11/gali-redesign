import { Link } from 'react-router';
import { products, productHref, fmt, discount, colorTone, type Product } from '../../data/catalog';
import { Icon } from '../ui/Icon';
import { store, useStore } from '../../store';

export function Price({ p, size = 'md' }: { p: Product; size?: 'md' | 'lg' }) {
  const big = size === 'lg';
  return (
    <p className={`num flex flex-wrap items-baseline gap-x-2.5 ${big ? 'text-[26px]' : 'text-[15px]'}`}>
      <span className={`font-bold ${p.was ? 'text-sale' : ''}`}>
        <span className="sr-only">{p.was ? 'מחיר מבצע: ' : 'מחיר: '}</span>{fmt(p.price)}&nbsp;₪
      </span>
      {p.was && (
        <s className={`text-ink-3 ${big ? 'text-base' : 'text-[13px]'}`}><span className="sr-only">במקום </span>{fmt(p.was)}&nbsp;₪</s>
      )}
    </p>
  );
}

/** Real Gali labels: NEW COLLECTION → "חדש", OUTLET / FINAL SALE with the derived discount. */
export function PromoLabels({ p, className = '' }: { p: Product; className?: string }) {
  if (!p.isNew && !p.saleType) return null;
  return (
    <p className={`flex flex-col items-start gap-1 text-[11px] leading-none ${className}`}>
      {p.isNew && <span className="latin text-ink">חדש</span>}
      {p.saleType && <span className="latin text-sale">{p.saleType}{p.was ? <> · <bdi dir="ltr">−{discount(p)}%</bdi></> : null}</span>}
    </p>
  );
}

export function WishButton({ id, className = '' }: { id: string; className?: string }) {
  const on = useStore((s) => s.wish.has(id));
  const name = products[id]?.name;
  return (
    <button
      type="button"
      className={`wish icon-btn ${className}`}
      aria-pressed={on}
      aria-label={on ? `הסרה מהמועדפים: ${name}` : `הוספה למועדפים: ${name}`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); store.toggleWish(id); }}
    >
      <Icon name="heart" className={`wish-icon size-[22px] transition-[fill,color,transform] duration-200 ${on ? 'fill-sale text-sale is-on' : 'fill-transparent'}`} />
    </button>
  );
}

export function Swatches({ p, max = 4 }: { p: Product; max?: number }) {
  const shown = p.variants.slice(0, max);
  const more = Math.max(p.colorCount, p.variants.length) - shown.length;
  if (Math.max(p.colorCount, p.variants.length) < 2) return null;
  return (
    <p className="mt-2 flex items-center gap-1.5" aria-label={`${Math.max(p.colorCount, p.variants.length)} צבעים`}>
      {shown.map((v) => <span key={v.code} title={v.color} className="size-3 rounded-full ring-1 ring-ink/15" style={{ background: colorTone(v.color) }} />)}
      {more > 0 && <span className="text-[12px] text-ink-3 ms-0.5" dir="ltr">+{more}</span>}
    </p>
  );
}

export function ProductCard({ id, tone = 'bg-[#efe9df]', priority = false, quickAdd = true }: { id: string; tone?: string; priority?: boolean; quickAdd?: boolean }) {
  const p = products[id];
  if (!p) return null;
  const v = p.variants[0];
  const sizes = v.sizes.filter((s) => s.available);
  const href = productHref(id);
  return (
    <article className="pcard group relative">
      <div className={`relative aspect-square overflow-hidden ${tone}`}>
        <img src={v.img} alt={`${p.brand} ${p.name}`} loading={priority ? 'eager' : 'lazy'} decoding="async"
          className="pcard-img absolute inset-0 size-full object-contain mix-blend-multiply scale-[1.12]" />
        {v.alt && (
          <img src={v.alt} alt="" aria-hidden loading="lazy" decoding="async"
            className="pcard-alt absolute inset-0 size-full object-contain mix-blend-multiply scale-[1.12]" />
        )}
        <PromoLabels p={p} className="absolute top-3 right-3" />
        <WishButton id={id} className="absolute top-1 left-1" />
        {quickAdd && (
          sizes.length ? (
            <div className="pcard-quick absolute inset-x-2 bottom-2 bg-paper/95 p-2">
              <p className="text-[12px] text-ink-2 mb-1.5 px-1">הוספה מהירה · בחרו מידה</p>
              <ul className="flex flex-wrap gap-1" aria-label={`הוספה מהירה לסל: ${p.name}`}>
                {sizes.map((s) => (
                  <li key={s.label}>
                    <button type="button" className="quick-size num h-8 min-w-9 px-1.5 text-[13px] font-medium border border-ink/15"
                      aria-label={`הוספה לסל במידה ${s.label}`}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); store.addToBag(id, v.code, s.label); }}>{s.label}</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Link to={href} className="pcard-quick absolute inset-x-3 bottom-3 flex h-11 items-center justify-center bg-paper text-[14px] font-semibold" tabIndex={-1} aria-hidden>
              בחירת מידה והוספה לסל
            </Link>
          )
        )}
      </div>
      <div className="pt-3.5 pe-2">
        <p className="latin text-[11px] text-ink-2">{p.brand}</p>
        <h3 className="mt-1 text-[15px] leading-snug">
          <Link to={href} className="pcard-link after:absolute after:inset-0">{p.name}</Link>
        </h3>
        <div className="mt-1.5"><Price p={p} /></div>
        {p.promo && <p className="mt-1 text-[13px] font-medium text-gali">{p.promo}</p>}
        <Swatches p={p} />
      </div>
    </article>
  );
}
