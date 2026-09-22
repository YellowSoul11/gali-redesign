import { catalog, subcats, intros, deptLabel, brandSlug, type Dept, type Product } from './catalog';

export interface Crumb { label: string; to?: string }
export interface RailItem { label: string; to: string; productId?: string; active?: boolean }
export interface CategoryDef {
  key: string;
  title: string;
  intro?: string;
  image?: string;           // campaign id
  crumbs: Crumb[];
  rail: RailItem[];
  scope: (p: Product) => boolean;
  /** show the department facet (scope spans departments) */
  multiDept: boolean;
  /** logo strip in the header */
  brandIndex?: boolean;
}

const DEPT_IMAGE: Record<Dept, string> = { women: '18113820437008717', men: '18391392736204145', girls: '17922499524415907', boys: '17933463726368776' };
// Intros: real category copy from gali.co.il where it exists; otherwise a short neutral line.
const DEPT_INTRO: Record<Dept, string> = {
  women: intros.women || 'נעלי נשים בסטייל שישלים כל לוק — קז׳ואל, ספורט או אלגנט, עם עקב או בלי.',
  men: intros.men || 'נעלי גברים לעבודה, לערב ולסוף השבוע — מ-Hush Puppies ועד סניקרס יומיומיים.',
  girls: intros.girls || 'נעלי בנות מצעד ראשון ועד סניקרס עם הדמויות האהובות.',
  boys: intros.boys || 'נעלי בנים לגן, לבית הספר ולמגרש — עם סוניק, ספיידרמן ופיקאצ׳ו.',
};

const firstIn = (f: (p: Product) => boolean) => catalog.find(f)?.id;
const deptRail = (dept: Dept, activeSlug?: string): RailItem[] =>
  subcats.filter((s) => s.dept === dept).map((s) => ({
    label: s.label, to: `/category/${s.slug}`, active: s.slug === activeSlug,
    productId: firstIn((p) => p.subcats.includes(s.slug)),
  }));
const home: Crumb = { label: 'ראשי', to: '/' };

export function getCategory(key: string, param?: string): CategoryDef | null {
  if (key === 'women' || key === 'men' || key === 'girls' || key === 'boys') {
    const d = key as Dept;
    return {
      key, title: deptLabel[d], intro: DEPT_INTRO[d], image: DEPT_IMAGE[d],
      crumbs: [home, { label: deptLabel[d] }], rail: deptRail(d),
      scope: (p) => p.dept === d, multiDept: false,
    };
  }
  if (key === 'kids') {
    return {
      key, title: 'ילדים', intro: 'נעלי ילדים מאז 1975 — לבנות ולבנים, מצעד ראשון ועד הגיבורים האהובים.', image: '18095442416382842',
      crumbs: [home, { label: 'ילדים' }],
      rail: [{ label: 'בנות', to: '/girls', productId: firstIn((p) => p.dept === 'girls') }, { label: 'בנים', to: '/boys', productId: firstIn((p) => p.dept === 'boys') }],
      scope: (p) => p.dept === 'girls' || p.dept === 'boys', multiDept: true,
    };
  }
  if (key === 'sale') {
    return {
      key, title: 'סוף עונה', intro: 'סוף עונה: סנדלים לכל המשפחה החל מ-49.90 ₪, לצד פריטי OUTLET ו-FINAL SALE. בתוקף עד 30.9.26.',
      crumbs: [home, { label: 'SALE' }],
      rail: (['women', 'men', 'girls', 'boys'] as Dept[]).map((d) => ({ label: `SALE ${deptLabel[d]}`, to: `/sale?dept=${d}`, productId: firstIn((p) => !!p.onSale && p.dept === d) })),
      scope: (p) => !!p.onSale, multiDept: true,
    };
  }
  if (key === 'new') {
    return {
      key, title: 'חדש בגלי', intro: 'הדגמים החדשים של העונה. זוג שני ב-59.90 ₪ על פריטי הקולקציה החדשה.', image: '18124651780873919',
      crumbs: [home, { label: 'NEW' }],
      rail: (['women', 'men', 'girls', 'boys'] as Dept[]).map((d) => ({ label: deptLabel[d], to: `/new?dept=${d}`, productId: firstIn((p) => !!p.isNew && p.dept === d) })).filter((r) => r.productId),
      scope: (p) => !!p.isNew, multiDept: true,
    };
  }
  if (key === 'brands') {
    return {
      key, title: 'מותגים', intro: 'לצד נעלי גלי: מותגים בינלאומיים כמו Hush Puppies, Caterpillar, Dockers ו-Lee Cooper.',
      crumbs: [home, { label: 'מותגים' }], rail: [], scope: () => true, multiDept: true, brandIndex: true,
    };
  }
  if (key === 'brand' && param) {
    const brand = catalog.find((p) => brandSlug(p.brand) === param)?.brand;
    if (!brand) return null;
    return {
      key: `brand-${param}`, title: brand, crumbs: [home, { label: 'מותגים', to: '/brands' }, { label: brand }], rail: [],
      scope: (p) => p.brand === brand, multiDept: true,
    };
  }
  if (key === 'category' && param) {
    const s = subcats.find((x) => x.slug === param);
    if (!s) return null;
    return {
      key: s.slug, title: s.label, intro: undefined,
      crumbs: [home, { label: deptLabel[s.dept], to: `/${s.dept}` }, { label: s.label }],
      rail: deptRail(s.dept, s.slug),
      scope: (p) => p.subcats.includes(s.slug), multiDept: false,
    };
  }
  return null;
}
