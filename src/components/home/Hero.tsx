import { campaign, cut, products, HERO_PRODUCT, fmt, departments, productHref } from '../../data/catalog';
import { Icon } from '../ui/Icon';

const HERO_IMG = '18124651780873919';

export function Hero() {
  const p = products[HERO_PRODUCT];
  return (
    <section aria-labelledby="hero-title" className="hero relative">
      <div className="lg:grid lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)] lg:min-h-[clamp(640px,calc(100svh-104px),860px)]">
        {/* Photo — end side (left in RTL), bleeds to the viewport edge */}
        <div className="hero-photo relative lg:order-2 overflow-hidden bg-blush aspect-[4/3.1] sm:aspect-[16/10] lg:aspect-auto">
          <img
            src={campaign(HERO_IMG, 1920)}
            srcSet={`${campaign(HERO_IMG, 960)} 960w, ${campaign(HERO_IMG, 1920)} 1920w`}
            sizes="(min-width: 1024px) 56vw, 100vw"
            alt="אם ושני ילדים בנעלי קולקציית החג של גלי, על רקע ורוד"
            fetchPriority="high"
            className="hero-photo-img absolute inset-0 size-full object-cover object-[46%_30%] lg:object-[46%_40%]"
          />
        </div>

        {/* Copy — start side */}
        <div className="relative lg:order-1 shell lg:max-w-none flex flex-col pb-12 lg:pt-[clamp(32px,6vh,72px)] lg:pb-[clamp(220px,30vh,300px)]">
          {/* Hero product: the start point of the flight into “חדש בגלי” */}
          {/* Decorative layer: on lg it is absolutely positioned and its box overlaps the CTA row,
              so it must not take pointer events. Only the product tag link opts back in. */}
          <div className="hero-product pointer-events-none relative z-10 flex items-end justify-between gap-4 -mt-[20vw] sm:-mt-[16vw] mb-4 lg:m-0 lg:absolute lg:bottom-[clamp(20px,4vh,44px)] lg:right-[var(--gutter)] lg:-left-[11%]">
            <a href={productHref(p.id)} className="hero-tag pointer-events-auto order-1 pb-2 text-[14px] leading-snug max-lg:pt-[22vw] sm:max-lg:pt-[18vw]">
              <span className="latin text-[11px] text-ink-2 block">{p.brand}</span>
              <span className="block mt-1">{p.name}</span>
              <span className="num block mt-1 font-semibold">{fmt(p.price)} ₪</span>
              <span className="mt-2 inline-flex items-center gap-1.5 font-semibold text-gali"><span className="ulink ulink-on">לרכישה</span><Icon name="arrow" className="size-3.5" /></span>
            </a>
            <div data-flight-from className="flight-slot order-2 relative w-[50%] sm:w-[42%] lg:w-[min(31vw,470px)] aspect-[1.3] -rotate-[9deg] shrink-0">
              <img src={cut(HERO_PRODUCT)} alt="" className="flight-static absolute inset-0 size-full object-contain drop-shadow-[0_28px_24px_rgb(21_21_20/0.22)]" />
            </div>
          </div>

          <div className="hero-copy max-w-[34rem]">
            <h1 id="hero-title" className="display text-[clamp(3.5rem,1.6rem+5.4vw,6.25rem)]">
              <span className="hero-line block">קולקציית</span>
              <span className="hero-line block text-gali">החג בגלי</span>
            </h1>
            <p className="soft mt-6 text-[17px] lg:text-lg text-ink-2 max-w-[30ch]">
              סניקרס, נעלי נוחות ומגפונים חדשים לנשים, לגברים ולילדים — כבר בחנויות ובאתר.
            </p>
            <p className="soft mt-4 flex items-center gap-2 text-[15px] text-gali">
              <span className="inline-block size-1.5 rounded-full bg-gali" aria-hidden />
              זוג שני ב-59.90 ₪ על פריטי הקולקציה החדשה
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#new" className="btn btn-primary">לקולקציה החדשה<Icon name="arrow" className="size-4" /></a>
              <a href="/sale" className="btn btn-outline">למבצעי סוף העונה</a>
            </div>
            <nav aria-label="קנייה לפי מחלקה" className="lg:hidden mt-8 grid grid-cols-4 border-t border-line">
              {departments.map((d) => (
                <a key={d.id} href={d.href} className="flex h-12 items-center justify-center text-[15px] font-medium border-b border-line">{d.label}</a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
