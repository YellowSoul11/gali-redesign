import { campaign } from '../../data/catalog';
import { ProductCard } from '../commerce/ProductCard';
import { Icon } from '../ui/Icon';

/** Editorial split: sticky full-length portrait + the look, shoppable. Copy adapted from gali.co.il/women. */
export function Editorial() {
  return (
    <section aria-labelledby="look-title" className="py-20 lg:py-32">
      <div className="shell grid grid-cols-[minmax(0,1fr)] lg:grid-cols-12 gap-x-5 gap-y-10">
        <div className="lg:col-span-7 lg:order-2">
          <figure className="lg:sticky lg:top-[calc(var(--header-h)+20px)] relative overflow-hidden bg-[#dcdbe4] aspect-[4/5] lg:aspect-auto lg:h-[min(calc(100svh-var(--header-h)-40px),860px)]">
            <img src={campaign('18113820437008717', 1920)} alt="אישה בחולצה לבנה, מכנסיים שחורים ונעלי מוקסין שחורות" loading="lazy"
              className="absolute inset-0 size-full object-cover object-[50%_30%]" />
          </figure>
        </div>
        <div className="lg:col-span-5 lg:order-1 lg:pt-10 flex flex-col">
          <h2 id="look-title" className="display text-[clamp(2.75rem,1.6rem+4vw,5.25rem)]">
            נעליים<br />שמשלימות<br /><em className="soft not-italic text-gali tracking-normal">כל לוק.</em>
          </h2>
          <p className="soft mt-6 text-[17px] text-ink-2 max-w-[36ch]">
            קז׳ואל, ספורט או אלגנט, עם עקב או בלי — נעלי הנשים של העונה, מהסניקרס של Lee Cooper ועד סנדלי העקב של Bianca Ballti.
          </p>
          <a href="/women" className="mt-6 inline-flex items-center gap-2 font-semibold self-start"><span className="ulink ulink-on">לכל נעלי הנשים</span><Icon name="arrow" className="size-4" /></a>

          <div className="mt-12 lg:mt-auto lg:pt-16 grid grid-cols-2 gap-x-4 gap-y-9">
            <ProductCard id="655653" />
            <ProductCard id="449208" />
            <ProductCard id="542087" />
            <ProductCard id="445130" />
          </div>
        </div>
      </div>
    </section>
  );
}
