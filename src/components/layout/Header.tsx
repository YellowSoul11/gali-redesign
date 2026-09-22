import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Logo } from '../ui/Logo';
import { Icon } from '../ui/Icon';
import { departments, campaign, subcatsOf } from '../../data/catalog';
import { store, useStore, bagCount } from '../../store';

const extraNav = [
  { label: 'NEW', href: '/new', latin: true },
  { label: 'SALE', href: '/sale', latin: true, sale: true },
  { label: 'מותגים', href: '/brands' },
  { label: 'Super Friends', href: 'https://www.gali.co.il/club' },
];

export function AnnouncementBar() {
  return (
    <div className="bg-gali text-white text-[13px]">
      <div className="shell flex h-9 items-center justify-between gap-6">
        <nav aria-label="שירות" className="hidden md:flex gap-5">
          <a className="ulink" href="https://www.gali.co.il/stores">סניפים</a>
          <a className="ulink" href="https://www.gali.co.il/customer-service">שירות לקוחות</a>
        </nav>
        <p className="soft mx-auto md:mx-0 truncate">
          משלוח חינם בקנייה מעל 199 ₪<span className="hidden sm:inline"><span className="mx-2 opacity-60">·</span>החזרות ללא עלות בסניפים</span>
        </p>
        <p className="hidden lg:flex items-center gap-3 opacity-90" aria-label="רשתות נוספות של בריל">
          <span className="opacity-75">גם בבריל:</span>
          {['Lee Cooper', 'Nine West', 'Step In', 'Aldo'].map((b) => <span key={b} className="font-medium" dir="ltr">{b}</span>)}
        </p>
      </div>
    </div>
  );
}

function Counter({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span key={n} className="count-bump absolute top-1.5 left-1 min-w-4 h-4 px-1 rounded-full bg-gali text-white text-[10px] font-semibold leading-4 text-center num">{n}</span>
  );
}

export function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timer = useRef<number>(0);
  const wish = useStore((s) => s.wish.size);
  const bag = useStore(bagCount);
  const { pathname, search } = useLocation();

  // close menus on navigation
  useEffect(() => { setOpen(null); setDrawer(false); }, [pathname, search]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = drawer ? 'hidden' : '';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && (setDrawer(false), setOpen(null));
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [drawer]);

  // hover intent: small open delay, slightly longer close delay
  const hover = (id: string | null) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(id), id ? (open ? 0 : 90) : 140);
  };
  const active = departments.find((d) => d.id === open);
  const isActive = (href: string) => pathname === href;

  return (
    <>
      <AnnouncementBar />
      <header
        className={`site-header sticky top-0 z-50 bg-paper transition-shadow duration-200 ${scrolled || open ? 'shadow-[0_1px_0_var(--color-line)]' : ''}`}
        onPointerLeave={() => hover(null)}
      >
        <div className="shell flex h-[var(--header-h)] items-center gap-4 lg:gap-10">
          <button className="icon-btn lg:hidden -ms-2" aria-label="פתיחת תפריט" aria-expanded={drawer} onClick={() => setDrawer(true)}>
            <Icon name="menu" />
          </button>
          <a href="/" className="text-gali shrink-0 max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2">
            <Logo className="h-8 lg:h-9 w-auto" />
          </a>

          <nav aria-label="ראשי" className="hidden lg:block h-full">
            <ul className="flex h-full items-stretch gap-1">
              {departments.map((d) => (
                <li key={d.id} className="flex" onPointerEnter={() => hover(d.id)}>
                  <a href={d.href} className="flex items-center px-3 text-[15px] font-medium" aria-expanded={open === d.id} aria-controls="mega"
                    aria-current={isActive(d.href) ? 'page' : undefined} onFocus={() => setOpen(d.id)}>
                    <span className={`ulink ${open === d.id || isActive(d.href) ? 'ulink-on' : ''}`}>{d.label}</span>
                  </a>
                </li>
              ))}
              <li aria-hidden className="w-px my-6 mx-2 bg-line" />
              {extraNav.map((n) => (
                <li key={n.label} className="flex" onPointerEnter={() => hover(null)}>
                  <a href={n.href} onFocus={() => setOpen(null)} aria-current={isActive(n.href) ? 'page' : undefined}
                    className={`flex items-center px-3 text-[15px] ${n.latin ? 'latin text-[13px]' : 'font-medium'} ${n.sale ? 'text-sale' : ''}`}>
                    <span className={`ulink ${isActive(n.href) ? 'ulink-on' : ''}`} dir={n.label === 'Super Friends' ? 'ltr' : undefined}>{n.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ms-auto flex items-center gap-1">
            <label className="hidden xl:flex items-center gap-2 h-11 w-64 px-3 me-2 bg-paper-2 rounded-[2px] focus-within:outline-2 focus-within:outline-gali">
              <Icon name="search" className="size-5 text-ink-2" />
              <input type="search" placeholder="חיפוש נעליים, מותגים…" className="w-full bg-transparent text-[14px] placeholder:text-ink-3 outline-none" />
            </label>
            <button className="icon-btn xl:hidden" aria-label="חיפוש"><Icon name="search" /></button>
            <a className="icon-btn max-sm:hidden" href="https://www.gali.co.il/customer/account/" aria-label="איזור אישי"><Icon name="user" /></a>
            <button className="icon-btn max-sm:hidden" onClick={() => store.open('wish')} aria-label={`מועדפים (${wish})`}><Icon name="heart" /><Counter n={wish} /></button>
            <button className="icon-btn -me-2" onClick={() => store.open('bag')} aria-label={`סל קניות (${bag})`}><Icon name="bag" /><Counter n={bag} /></button>
          </div>
        </div>

        {/* Mega menu */}
        <div id="mega" className={`mega absolute inset-x-0 top-full bg-paper shadow-[0_1px_0_var(--color-line),0_24px_40px_-24px_rgb(21_21_20/0.25)] ${active ? 'is-open' : ''}`}
          onPointerEnter={() => window.clearTimeout(timer.current)} hidden={!active}>
          {active && (
            <div className="shell grid grid-cols-12 gap-8 py-10">
              <div className="col-span-3">
                <p className="display text-6xl">{active.label}</p>
                <a href={active.href} className="mt-6 inline-flex items-center gap-2 font-semibold">
                  <span className="ulink ulink-on">לכל נעלי ה{active.label}</span><Icon name="arrow" className="size-4" />
                </a>
              </div>
              <ul className="col-span-5 columns-2 gap-8 text-[15px]">
                {subcatsOf(active.id).map((s) => (
                  <li key={s.slug} className="break-inside-avoid"><a className="block py-1.5 text-ink-2 hover:text-ink" href={`/category/${s.slug}`}><span className="ulink">{s.label}</span></a></li>
                ))}
                <li><a className="block py-1.5 text-sale" href={`/sale?dept=${active.id}`}><span className="ulink">SALE {active.label}</span></a></li>
              </ul>
              <a href={active.href} className="col-span-4 block overflow-hidden aspect-[16/10] bg-paper-2" aria-label={`לכל נעלי ה${active.label}`}>
                <img key={active.id} src={campaign(active.image, 960)} alt="" className="mega-img size-full object-cover object-[50%_22%]" />
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`drawer fixed inset-0 z-[60] overflow-hidden lg:hidden ${drawer ? 'is-open' : ''}`} aria-hidden={!drawer} inert={!drawer}>
        <div className="drawer-scrim absolute inset-0 bg-ink/40" onClick={() => setDrawer(false)} />
        <div role="dialog" aria-modal="true" aria-label="תפריט" className="drawer-panel absolute inset-y-0 right-0 w-[min(88vw,420px)] bg-paper flex flex-col">
          <div className="flex items-center justify-between h-[var(--header-h)] px-4 border-b border-line">
            <Logo className="h-7 w-auto text-gali" />
            <button className="icon-btn" aria-label="סגירת תפריט" onClick={() => setDrawer(false)}><Icon name="close" /></button>
          </div>
          <nav aria-label="ראשי – נייד" className="flex-1 overflow-y-auto px-4 pb-8">
            {departments.map((d) => (
              <details key={d.id} className="group border-b border-line">
                <summary className="flex items-center justify-between py-4 list-none cursor-pointer">
                  <span className="display text-[2.5rem]">{d.label}</span>
                  <Icon name="down" className="size-5 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <ul className="grid grid-cols-2 gap-x-4 pb-5 text-[15px]">
                  <li className="col-span-2"><a className="block py-2.5 font-semibold" href={d.href}>לכל נעלי ה{d.label}</a></li>
                  {subcatsOf(d.id).map((s) => <li key={s.slug}><a className="block py-2.5 text-ink-2" href={`/category/${s.slug}`}>{s.label}</a></li>)}
                </ul>
              </details>
            ))}
            <ul className="mt-6 grid grid-cols-2 gap-3">
              {extraNav.map((n) => (
                <li key={n.label}>
                  <a href={n.href} className={`flex h-14 items-center justify-center bg-paper-2 ${n.latin ? 'latin text-sm' : 'font-medium'} ${n.sale ? 'text-sale' : ''}`}>{n.label}</a>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 text-[15px] text-ink-2">
              <button className="flex items-center gap-3 text-start" onClick={() => { setDrawer(false); store.open('wish'); }}><Icon name="heart" className="size-5" />מועדפים ({wish})</button>
              <a href="https://www.gali.co.il/customer/account/" className="flex items-center gap-3"><Icon name="user" className="size-5" />איזור אישי</a>
              <a href="https://www.gali.co.il/stores" className="flex items-center gap-3"><Icon name="pin" className="size-5" />סניפים</a>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
