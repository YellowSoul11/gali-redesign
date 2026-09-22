import { ProductCard } from '../commerce/ProductCard';
import { Icon } from '../ui/Icon';

/** End of season — real promo: "סוף עונה – סנדלים לכל המשפחה החל מ-49.90 ₪, בתוקף עד 30.9.26". Price set as typography. */
export function SaleStory() {
  return (
    <section aria-labelledby="sale-title" className="py-20 lg:py-32 border-b border-line">
      <div className="shell">
        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-12 gap-x-5 gap-y-6 items-end">
          <div className="lg:col-span-5">
            <h2 id="sale-title" className="display text-[clamp(2.75rem,1.4rem+4vw,5rem)]">סוף עונה.</h2>
            <p className="soft mt-4 text-xl">סנדלים לכל המשפחה</p>
            <p className="mt-2 text-ink-2 text-[15px]">בתוקף עד 30.9.26.{' '}<a className="ulink ulink-on" href="https://www.gali.co.il/terms-of-sale">תקנון מבצעים</a></p>
            <a href="/sale" className="btn btn-primary mt-8">לכל הסנדלים במבצע<Icon name="arrow" className="size-4" /></a>
          </div>
          <p className="lg:col-span-7 text-sale leading-[0.8] select-none lg:text-left" aria-label="החל מ-49.90 ₪">
            <span className="block text-lg lg:text-xl font-semibold text-ink mb-3 lg:mb-5" aria-hidden>החל מ-</span>
            {/* price-tag lockup: 49 | .90 over ₪ */}
            <span aria-hidden className="inline-flex items-start num font-bold tracking-[-0.05em] text-[clamp(6.5rem,2rem+18vw,17rem)]" dir="ltr">
              <span>49</span>
              <span className="flex flex-col items-start text-[0.42em] pt-[0.12em] leading-[0.85]">
                <span>.90</span><span className="text-[0.62em] ps-[0.18em] pt-[0.15em]">₪</span>
              </span>
            </span>
          </p>
        </div>
        <ul className="mt-14 lg:mt-20 grid grid-cols-2 lg:grid-cols-5 gap-x-4 lg:gap-x-5 gap-y-10">
          {['445175', '540045', '542210', '547100', '542138'].map((id, i) => (
            <li key={id} className={i === 4 ? 'max-lg:hidden' : ''}><ProductCard id={id} /></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
