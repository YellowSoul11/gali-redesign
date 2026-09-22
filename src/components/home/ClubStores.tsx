import { Icon } from '../ui/Icon';

const regions = ['צפון', 'שרון', 'מרכז', 'שפלה', 'ירושלים', 'דרום', 'אילת'];

/** Super Friends (real terms from gali.co.il/club) + store network & service promises. */
export function ClubStores() {
  return (
    <section aria-label="מועדון וסניפים" className="grid lg:grid-cols-2">
      <div className="bg-gali text-white px-[var(--gutter)] py-16 lg:py-24 lg:ps-[max(var(--gutter),calc((100vw-1560px)/2+var(--gutter)))]">
        <h2 className="display text-[clamp(2.75rem,1.6rem+3.6vw,4.75rem)]" dir="ltr" style={{ textAlign: 'right' }}>Super Friends</h2>
        <p className="soft mt-3 text-lg text-white/85">מועדון הלקוחות של גלי ורשתות בריל.</p>
        <dl className="mt-10 divide-y divide-white/25 border-y border-white/25">
          {[
            ['10%', 'חוזרים אליכם בצבירה מכל קנייה'],
            ['50 ₪', 'מתנת הצטרפות, למימוש בחודש שלאחר ההצטרפות'],
            ['20%', 'הנחת יום הולדת, בקנייה אחת עד 700 ₪'],
          ].map(([n, t]) => (
            <div key={n} className="flex items-baseline gap-6 py-5">
              <dt className="num text-4xl lg:text-5xl font-bold tracking-[-0.03em] w-28 lg:w-36 shrink-0">{n}</dt>
              <dd className="text-[16px] text-white/90">{t}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a href="https://www.gali.co.il/club" className="btn bg-white text-gali hover:bg-paper">הצטרפות למועדון</a>
          <p className="text-[14px] text-white/80">דמי חבר 49.90 ₪ לשנה. <a className="ulink ulink-on" href="https://www.gali.co.il/membership-terms">תקנון המועדון</a></p>
        </div>
      </div>

      <div className="bg-paper-2 px-[var(--gutter)] py-16 lg:py-24 lg:pe-[max(var(--gutter),calc((100vw-1560px)/2+var(--gutter)))]">
        <h2 className="display text-[clamp(2.75rem,1.6rem+3.6vw,4.75rem)]">גלי בסניפים</h2>
        <p className="soft mt-3 text-lg text-ink-2">מודדים בחנות, מחזירים בחנות.</p>
        <ul className="mt-10 flex flex-wrap gap-2" aria-label="אזורים">
          {regions.map((r) => (
            <li key={r}><a href="https://www.gali.co.il/stores" className="region inline-flex h-11 items-center px-4 border border-ink/20 text-[15px] font-medium">{r}</a></li>
          ))}
        </ul>
        <ul className="mt-10 space-y-4 text-[16px]">
          <li className="flex items-center gap-3"><Icon name="truck" className="size-6 text-gali" />משלוח חינם בקנייה מעל 199 ₪</li>
          <li className="flex items-center gap-3"><Icon name="returns" className="size-6 text-gali" />החזרות ללא עלות בסניפים</li>
          <li className="flex items-center gap-3"><Icon name="pin" className="size-6 text-gali" />החזרת פריט עם שליח</li>
        </ul>
        <a href="https://www.gali.co.il/stores" className="btn btn-primary mt-10">מציאת סניף<Icon name="arrow" className="size-4" /></a>
      </div>
    </section>
  );
}
