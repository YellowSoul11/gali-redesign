import { products, productHref, fmt } from '../../data/catalog';
import { FREE_SHIPPING } from '../../data/sizeCharts';
import { store, useStore, type BagLine } from '../../store';
import { Sheet } from '../ui/Sheet';
import { Icon } from '../ui/Icon';

const COURIER = 24.9; // real: "עלות שליח עד הבית- ₪24.90"

function Line({ l, highlight }: { l: BagLine; highlight: boolean }) {
  const p = products[l.id];
  if (!p) return null;
  const v = p.variants.find((x) => x.code === l.code) ?? p.variants[0];
  return (
    <li className={`bag-line flex gap-4 py-5 ${highlight ? 'is-new' : ''}`}>
      <a href={productHref(p.id, v.code)} className="shrink-0 size-24 bg-[#efe9df] grid place-items-center" onClick={() => store.close()}>
        <img src={v.img} alt="" className="size-full object-contain mix-blend-multiply scale-110" />
      </a>
      <div className="flex-1 min-w-0">
        <p className="latin text-[11px] text-ink-2">{p.brand}</p>
        <a href={productHref(p.id, v.code)} className="block text-[15px] leading-snug mt-0.5 hover:underline" onClick={() => store.close()}>{p.name}</a>
        <p className="mt-1 text-[13px] text-ink-2">{v.color && <>{v.color} · </>}מידה <span className="num">{l.size}</span></p>
        {p.promo && <p className="mt-0.5 text-[12px] text-gali font-medium">{p.promo}</p>}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center border border-line" role="group" aria-label={`כמות: ${p.name}`}>
            <button className="grid place-items-center size-9" aria-label="הפחתת כמות" onClick={() => store.setQty(l.key, l.qty - 1)}><Icon name="minus" className="size-4" /></button>
            <span className="num w-7 text-center text-[14px] font-semibold" aria-live="polite">{l.qty}</span>
            <button className="grid place-items-center size-9 disabled:opacity-30" aria-label="הוספת כמות" disabled={l.qty >= 9} onClick={() => store.setQty(l.key, l.qty + 1)}><Icon name="plus" className="size-4" /></button>
          </div>
          <p className="num text-[15px] font-bold">{fmt(p.price * l.qty)} ₪</p>
        </div>
        <button className="mt-2 text-[13px] text-ink-3 underline underline-offset-4 hover:text-ink" onClick={() => store.remove(l.key)}>הסרה</button>
      </div>
    </li>
  );
}

function Bag() {
  const bag = useStore((s) => s.bag);
  const lastAdded = useStore((s) => s.lastAdded);
  const subtotal = bag.reduce((n, l) => n + (products[l.id]?.price ?? 0) * l.qty, 0);
  const left = Math.max(0, FREE_SHIPPING - subtotal);
  const shipping = left > 0 ? COURIER : 0;
  const open = useStore((s) => s.drawer === 'bag');
  const count = bag.reduce((n, l) => n + l.qty, 0);

  return (
    <Sheet open={open} onClose={store.close} labelledBy="bag-title" title={<>סל הקניות <span className="num text-ink-3 font-normal">({count})</span></>}
      footer={bag.length ? (
        <div>
          <dl className="space-y-1.5 text-[15px]">
            <div className="flex justify-between"><dt>סכום ביניים</dt><dd className="num">{fmt(subtotal)} ₪</dd></div>
            <div className="flex justify-between"><dt>משלוח עד הבית</dt><dd className="num">{shipping ? `${fmt(shipping)} ₪` : 'חינם'}</dd></div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-line mt-2"><dt>סה״כ</dt><dd className="num">{fmt(subtotal + shipping)} ₪</dd></div>
          </dl>
          <button className="btn btn-primary w-full mt-4" disabled aria-describedby="checkout-note">מעבר לקופה</button>
          <p id="checkout-note" className="mt-2 text-[12px] text-ink-3 text-center">הקופה אינה חלק משלב זה של הקונספט.</p>
          <button className="btn btn-outline w-full mt-3" onClick={store.close}>המשך בקנייה</button>
        </div>
      ) : undefined}>
      {bag.length ? (
        <div className="px-5">
          {lastAdded && (
            <p role="status" className="added-note mt-4 flex items-center gap-2 text-[14px] font-semibold text-gali">
              <span className="grid place-items-center size-6 rounded-full bg-gali text-white"><Icon name="check" className="size-4" /></span>
              המוצר נוסף לסל
            </p>
          )}
          <div className="mt-4 bg-paper-2 p-4">
            <p className="text-[14px]">
              {left > 0 ? <>עוד <strong className="num">{fmt(left)} ₪</strong> ומשלוח עד הבית חינם</> : <strong className="text-gali">מגיע לך משלוח חינם</strong>}
            </p>
            <div className="mt-2 h-1 bg-line overflow-hidden" aria-hidden>
              <div className="ship-bar h-full w-full bg-gali origin-right" style={{ transform: `scaleX(${Math.min(1, subtotal / FREE_SHIPPING)})` }} />
            </div>
          </div>
          <ul className="divide-y divide-line">{bag.map((l) => <Line key={l.key} l={l} highlight={l.key === lastAdded} />)}</ul>
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-lg font-semibold">הסל שלך ריק</p>
          <p className="soft mt-2 text-ink-2">הדגמים החדשים של העונה מחכים לך.</p>
          <div className="mt-6 flex flex-col gap-3">
            <a href="/new" className="btn btn-primary" onClick={store.close}>לקולקציה החדשה</a>
            <a href="/sale" className="btn btn-outline" onClick={store.close}>למבצעי סוף העונה</a>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function Wishlist() {
  const wish = useStore((s) => s.wish);
  const open = useStore((s) => s.drawer === 'wish');
  const ids = [...wish].filter((id) => products[id]);
  return (
    <Sheet open={open} onClose={store.close} labelledBy="wish-title" title={<>מועדפים <span className="num text-ink-3 font-normal">({ids.length})</span></>}>
      {ids.length ? (
        <ul className="px-5 divide-y divide-line">
          {ids.map((id) => {
            const p = products[id];
            return (
              <li key={id} className="flex gap-4 py-5">
                <a href={productHref(id)} onClick={store.close} className="shrink-0 size-24 bg-[#efe9df]"><img src={p.variants[0].img} alt="" className="size-full object-contain mix-blend-multiply scale-110" /></a>
                <div className="flex-1">
                  <p className="latin text-[11px] text-ink-2">{p.brand}</p>
                  <a href={productHref(id)} onClick={store.close} className="block text-[15px] leading-snug hover:underline">{p.name}</a>
                  <p className={`num mt-1 font-bold ${p.was ? 'text-sale' : ''}`}>{fmt(p.price)} ₪</p>
                  <div className="mt-2 flex gap-4 text-[13px]">
                    <a href={productHref(id)} onClick={store.close} className="font-semibold ulink ulink-on">בחירת מידה</a>
                    <button className="text-ink-3 underline underline-offset-4" onClick={() => store.toggleWish(id)}>הסרה</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="p-8 text-center">
          <p className="text-lg font-semibold">עדיין אין מועדפים</p>
          <p className="soft mt-2 text-ink-2">לחצו על הלב בכל מוצר כדי לשמור אותו כאן.</p>
        </div>
      )}
    </Sheet>
  );
}

export function Drawers() {
  return <><Bag /><Wishlist /></>;
}
