import { useLayoutEffect, useRef, useState } from 'react';
import { products, cut, HERO_PRODUCT, productHref } from '../../data/catalog';
import { ProductCard, Price, WishButton } from '../commerce/ProductCard';
import { Icon } from '../ui/Icon';

const tabs = [
  { id: 'all', label: 'הכל', ids: ['655642', '657630', '656648', '647683'], href: '/new' },
  { id: 'women', label: 'נשים', ids: ['655642', '655653', '655643'], href: '/women' },
  { id: 'girls', label: 'בנות', ids: ['657630', '657629', '647683', '457060'], href: '/girls' },
  { id: 'boys', label: 'בנים', ids: ['656648', '656642', '656652', '640060'], href: '/boys' },
];

function Tabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ x: 0, w: 0 });
  useLayoutEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(`[data-tab="${value}"]`);
    const parent = ref.current;
    if (!el || !parent) return;
    const measure = () => setBar({ x: el.offsetLeft, w: el.offsetWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [value]);
  return (
    <div ref={ref} role="tablist" aria-label="סינון הקולקציה החדשה" className="relative flex gap-6 border-b border-line overflow-x-auto no-scrollbar">
      {tabs.map((t) => (
        <button key={t.id} data-tab={t.id} role="tab" aria-selected={value === t.id} aria-controls="new-grid"
          onClick={() => onChange(t.id)}
          className={`h-11 shrink-0 text-[15px] font-medium transition-colors duration-150 ${value === t.id ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}>
          {t.label}
        </button>
      ))}
      <span aria-hidden className="tab-bar absolute bottom-[-1px] left-0 h-[2px] w-px origin-left bg-ink" style={{ transform: `translateX(${bar.x}px) scaleX(${bar.w})` }} />
    </div>
  );
}

function LeadCard() {
  const p = products[HERO_PRODUCT];
  return (
    <article className="lead relative bg-sand flex flex-col h-full">
      <p className="absolute top-5 right-6 latin text-[11px]">חדש</p>
      <WishButton id={p.id} className="absolute top-3 left-3 z-10" />
      <div className="flex-1 grid place-items-center px-[8%] pt-16 pb-4 min-h-[340px]">
        <div data-flight-to className="flight-slot relative w-full max-w-[560px] aspect-[1.3]">
          <img src={cut(p.id)} alt={`${p.brand} ${p.name}`} loading="lazy" className="flight-static absolute inset-0 size-full object-contain drop-shadow-[0_22px_18px_rgb(21_21_20/0.18)]" />
        </div>
      </div>
      <div className="px-6 pb-6 lg:px-8 lg:pb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div>
          <p className="latin text-[11px] text-ink-2">{p.brand}</p>
          <h3 className="mt-1.5 text-2xl font-semibold leading-tight">
            <a href={productHref(p.id)} className="after:absolute after:inset-0">{p.name}</a>
          </h3>
          <div className="mt-2"><Price p={p} size="lg" /></div>
          <p className="mt-1 text-[14px] font-medium text-gali">{p.promo}</p>
        </div>
        <a href={productHref(p.id)} className="btn btn-primary relative z-10">בחירת מידה</a>
      </div>
    </article>
  );
}

export function NewCollection() {
  const [tab, setTab] = useState('all');
  const current = tabs.find((t) => t.id === tab)!;
  return (
    <section id="new" aria-labelledby="new-title" className="relative pt-20 pb-24 lg:pt-28 lg:pb-32">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 mb-8 lg:mb-10">
          <div>
            <h2 id="new-title" className="h-section">חדש בגלי</h2>
            <p className="soft mt-3 text-ink-2 text-[17px]">הדגמים החדשים של העונה. זוג שני ב-59.90 ₪.</p>
          </div>
          <a href="/new" className="inline-flex items-center gap-2 font-semibold"><span className="ulink ulink-on">לכל הקולקציה החדשה</span><Icon name="arrow" className="size-4" /></a>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-x-5 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-6 lg:self-start lg:sticky lg:top-[calc(var(--header-h)+20px)] lg:h-[min(calc(100svh-var(--header-h)-40px),760px)]"><LeadCard /></div>
          <div className="lg:col-span-6 lg:pb-4">
            <Tabs value={tab} onChange={setTab} />
            <div id="new-grid" role="tabpanel" aria-label={current.label}
              className="new-grid mt-6 grid grid-cols-2 gap-x-4 gap-y-9 lg:gap-x-5 max-lg:flex max-lg:overflow-x-auto max-lg:snap-x max-lg:snap-mandatory max-lg:-mx-[var(--gutter)] max-lg:px-[var(--gutter)] max-lg:scroll-px-[var(--gutter)] no-scrollbar">
              {current.ids.map((id) => (
                <div key={tab + id} className="grid-item max-lg:w-[46vw] max-lg:max-w-[260px] max-lg:shrink-0 max-lg:snap-start"><ProductCard id={id} /></div>
              ))}
              {current.ids.length < 4 && (
                <a key={tab + 'all'} href={current.href} className="grid-item max-lg:w-[46vw] max-lg:shrink-0 aspect-square flex flex-col justify-end p-5 bg-ink text-paper">
                  <span className="display text-4xl">כל ה{current.label}</span>
                  <span className="mt-2 inline-flex items-center gap-2 text-[14px] font-semibold">לקולקציה המלאה<Icon name="arrow" className="size-4" /></span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
