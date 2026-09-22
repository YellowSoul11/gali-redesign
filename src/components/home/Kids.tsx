import { campaign } from '../../data/catalog';
import { ProductCard } from '../commerce/ProductCard';
import { Icon } from '../ui/Icon';

// Tones echo Gali's own studio sets: sky, blush, sun-yellow blocks.
const rail: [string, string][] = [
  ['656648', 'bg-sky'], ['657630', 'bg-blush'], ['656652', 'bg-[#f6dc86]'], ['647683', 'bg-blush'], ['656642', 'bg-sky'], ['457060', 'bg-[#f6dc86]'],
];

export function Kids() {
  return (
    <section aria-labelledby="kids-title" className="bg-[#f6dc86] pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden">
      <div className="shell">
        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-12 gap-x-5 gap-y-10 items-end">
          <div className="lg:col-span-5">
            <h2 id="kids-title" className="display text-[clamp(3rem,1.4rem+5vw,6rem)]">
              נעלי ילדים<br />
              <span className="soft">מאז 1975.</span>
            </h2>
            <p className="soft mt-6 text-[17px] text-ink max-w-[38ch]">
              גלי התחילה כמותג ישראלי של נעלי ספורט וילדים. היום — מנעלי צעד ראשון ועד הגיבורים האהובים: סוניק, ספיידרמן, סטיץ׳ ופיקאצ׳ו.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/girls" className="btn btn-primary">לנעלי בנות</a>
              <a href="/boys" className="btn btn-outline">לנעלי בנים</a>
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-[5fr_4fr] gap-4 lg:gap-5 items-end">
            <img src={campaign('17933463726368776', 960)} alt="ילד בנעלי סוניק של גלי" loading="lazy" className="w-full aspect-[4/5] object-cover" />
            <img src={campaign('18095442416382842', 960)} alt="פעוטה בצעדים ראשונים בנעלי גלי" loading="lazy" className="w-full aspect-[4/5] object-cover lg:mb-16" />
          </div>
        </div>

        <div className="mt-14 lg:mt-20 flex items-center justify-between">
          <h3 className="text-xl font-semibold">הדמויות האהובות, עכשיו בזוג שני ב-59.90 ₪</h3>
          <a href="/new" className="hidden sm:inline-flex items-center gap-2 font-semibold"><span className="ulink ulink-on">לכל החדש לילדים</span><Icon name="arrow" className="size-4" /></a>
        </div>
        <ul className="mt-6 flex gap-4 lg:grid lg:grid-cols-6 lg:gap-5 overflow-x-auto snap-x snap-mandatory -mx-[var(--gutter)] px-[var(--gutter)] scroll-px-[var(--gutter)] lg:mx-0 lg:px-0 no-scrollbar">
          {rail.map(([id, tone]) => (
            <li key={id} className="w-[46vw] max-w-[240px] lg:w-auto lg:max-w-none shrink-0 snap-start"><ProductCard id={id} tone={tone} /></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
