import { useState, type FormEvent } from 'react';
import { Logo } from '../ui/Logo';
import { Icon } from '../ui/Icon';

const G = 'https://www.gali.co.il';
// routes that exist in this concept; everything else links to the real gali.co.il page
const INTERNAL = new Set(['/women', '/men', '/girls', '/boys', '/kids', '/new', '/sale', '/brands']);
const cols: { title: string; links: [string, string][] }[] = [
  { title: 'קטגוריות', links: [['נשים', '/women'], ['גברים', '/men'], ['בנות', '/girls'], ['בנים', '/boys'], ['ילדים', '/kids'], ['NEW', '/new'], ['SALE', '/sale'], ['מותגים', '/brands'], ['נעליים תקניות – כוחות הביטחון', '/sale/soldier'], ['אביזרים', '/accessories']] },
  { title: 'מידע שימושי', links: [['שירות לקוחות', '/customer-service'], ['שאלות ותשובות', '/faq'], ['מדיניות משלוחים', '/customer-service/shipping'], ['החלפות והחזרות', '/customer-service/returns'], ['החזרת פריט עם שליח', '/return'], ['ביטול עסקה', '/customer-service/cancel-order'], ['סניפים', '/stores']] },
  { title: 'גלי', links: [['אודות', '/about-gali'], ['דרושים', '/jobs-gali'], ['מועדון הלקוחות', '/club'], ['GIFT CARD', '/giftcard/buy-brill'], ['דיווחים', '/announcement-investors']] },
  { title: 'תקנונים', links: [['תקנון האתר', '/terms-of-use'], ['תקנון מבצעים', '/terms-of-sale'], ['תקנון מועדון הלקוחות', '/membership-terms'], ['תקנון גיפט קארד', '/giftcard-terms-gali'], ['מדיניות הפרטיות', '/privacy-policy'], ['הצהרת נגישות', '/accessibility']] },
];

function Newsletter() {
  const [state, setState] = useState<'idle' | 'error' | 'done'>('idle');
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email')?.toString() ?? '';
    setState(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'done' : 'error');
  };
  return (
    <section aria-labelledby="nl-title" className="border-b border-paper/15">
      <div className="shell grid lg:grid-cols-12 gap-x-5 gap-y-8 py-16 lg:py-20 items-end">
        <div className="lg:col-span-6">
          <h2 id="nl-title" className="display text-[clamp(2.5rem,1.5rem+3vw,4.25rem)]">10% הנחה<br /><span className="soft">לרכישה הראשונה.</span></h2>
          <p className="soft mt-4 text-paper/75 text-[16px] max-w-[40ch]">הצטרפו לרשימת הדיוור של גלי וקבלו עדכונים על קולקציות חדשות ומבצעים.</p>
        </div>
        <div className="lg:col-span-6">
          {state === 'done' ? (
            <p role="status" className="text-xl font-medium">תודה! קוד ההנחה בדרך למייל שלכם.</p>
          ) : (
            <form onSubmit={submit} noValidate className="w-full">
              <label htmlFor="nl-email" className="text-[14px] text-paper/75">כתובת מייל</label>
              <div className="mt-2 flex border-b border-paper/60 focus-within:border-paper">
                <input id="nl-email" name="email" type="email" dir="ltr" autoComplete="email" placeholder="name@example.com"
                  aria-invalid={state === 'error'} aria-describedby={state === 'error' ? 'nl-err' : undefined}
                  className="flex-1 h-14 bg-transparent text-lg text-right placeholder:text-paper/40 outline-none" onChange={() => state === 'error' && setState('idle')} />
                <button type="submit" className="flex items-center gap-2 px-2 font-semibold">הרשמה<Icon name="arrow" className="size-4" /></button>
              </div>
              {state === 'error' && <p id="nl-err" className="mt-2 text-[14px] text-[#ffb4a6]">כתובת המייל לא תקינה. בדקו ונסו שוב.</p>}
              <label className="mt-4 flex items-start gap-3 text-[13px] text-paper/70">
                <input type="checkbox" className="mt-0.5 size-4 accent-gali" />
                אני מאשר/ת קבלת דיוור ומבצעים מגלי במייל וב-SMS.
              </label>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <Newsletter />
      <div className="shell py-14 lg:py-20 grid grid-cols-2 lg:grid-cols-12 gap-x-5 gap-y-10">
        <div className="col-span-2 lg:col-span-4">
          <Logo className="h-10 w-auto text-paper" />
          <p className="mt-5 text-paper/70 text-[15px] max-w-[34ch]">רשת הנעליים של ישראל. נעליים לכל המשפחה מאז 1975.</p>
          <address className="not-italic mt-6 space-y-1 text-[15px] text-paper/80">
            <a className="ulink block w-fit" href="mailto:cs@brillind.co.il" dir="ltr">cs@brillind.co.il</a>
            <span className="block">יעקב פרימן 20, ראשון לציון</span>
          </address>
          <div className="mt-6 flex gap-2">
            <a href="https://www.instagram.com/gali_shoes/" className="inline-flex h-10 items-center px-4 border border-paper/25 text-[14px]">Instagram</a>
            <a href="https://www.facebook.com/MyGali/" className="inline-flex h-10 items-center px-4 border border-paper/25 text-[14px]">Facebook</a>
          </div>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title} className="lg:col-span-2">
            <h3 className="text-[13px] text-paper/60 mb-4">{c.title}</h3>
            <ul className="space-y-2.5 text-[15px]">
              {c.links.map(([t, h]) => <li key={h}><a className="ulink" href={INTERNAL.has(h) ? h : G + h}>{t}</a></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="shell py-6 border-t border-paper/15 flex flex-wrap items-center justify-between gap-4 text-[13px] text-paper/60">
        <p>© גלי, חברה בקבוצת בריל. תשלומים מאובטחים: Visa, Mastercard, American Express, Diners.</p>
        <p>קונספט עיצוב מחדש לא רשמי — אינו האתר של גלי.</p>
      </div>
    </footer>
  );
}
