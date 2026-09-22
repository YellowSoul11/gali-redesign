// Hand-curated homepage records (captured 2026-09-22). Used only as a fallback when a style is missing from catalog.generated.json.
export type LegacyDept = 'women' | 'men' | 'girls' | 'boys';
export interface LegacyProduct { id: string; brand: string; name: string; price: number; was?: number; promo?: string; saleType?: 'OUTLET' | 'FINAL SALE'; isNew?: boolean; colors: string[]; dept: LegacyDept; url: string; cutout?: boolean }

const SECOND_PAIR = 'זוג שני ב-59.90 ₪';

export const legacyProducts: Record<string, LegacyProduct> = {
  '655644': { id: '655644', brand: 'LEE COOPER', name: 'סניקרס סטייל אורבני לנשים', price: 249.9, promo: SECOND_PAIR, isNew: true, colors: ['בז׳'], dept: 'women', url: 'https://www.gali.co.il/new', cutout: true },
  '655642': { id: '655642', brand: 'LEE COOPER', name: 'סניקרס פסים אופנתי לנשים', price: 249.9, promo: SECOND_PAIR, isNew: true, colors: ['חום', 'בז׳'], dept: 'women', url: 'https://www.gali.co.il/new', cutout: true },
  '655653': { id: '655653', brand: 'LEE COOPER', name: 'נעלי סניקרס אופנתיות לנשים', price: 249.9, promo: SECOND_PAIR, isNew: true, colors: ['חום', 'בז׳'], dept: 'women', url: 'https://www.gali.co.il/new', cutout: true },
  '655643': { id: '655643', brand: 'LEE COOPER', name: 'סניקרס ספורט אופנתי לנשים', price: 249.9, promo: SECOND_PAIR, isNew: true, colors: ['בז׳', 'חום'], dept: 'women', url: 'https://www.gali.co.il/new' },
  '640060': { id: '640060', brand: 'CHAMPION', name: 'נעלי סניקרס אופנתיות לילדים', price: 249.9, promo: SECOND_PAIR, isNew: true, colors: ['לבן+שחור'], dept: 'boys', url: 'https://www.gali.co.il/boys', cutout: true },
  '647683': { id: '647683', brand: 'GALI', name: 'נעלי סניקרס בדוגמת פרוזן לילדות', price: 199.9, promo: SECOND_PAIR, isNew: true, colors: ['ורוד', 'כחול'], dept: 'girls', url: 'https://www.gali.co.il/girls', cutout: true },
  '657630': { id: '657630', brand: 'STITCH', name: 'נעלי ספורט בעיצוב סטיץ׳ ואנג׳ל', price: 199.9, promo: SECOND_PAIR, isNew: true, colors: ['סגול'], dept: 'girls', url: 'https://www.gali.co.il/new', cutout: true },
  '657629': { id: '657629', brand: 'STITCH', name: 'נעלי ספורט בעיצוב אנג׳ל', price: 199.9, promo: SECOND_PAIR, isNew: true, colors: ['ורוד'], dept: 'girls', url: 'https://www.gali.co.il/new' },
  '656648': { id: '656648', brand: 'SONIC', name: 'נעלי ספורט בעיצוב סוניק', price: 199.9, promo: SECOND_PAIR, isNew: true, colors: ['כחול'], dept: 'boys', url: 'https://www.gali.co.il/boys' },
  '656642': { id: '656642', brand: 'SPIDER MAN', name: 'נעלי ספורט בעיצוב ספיידרמן', price: 199.9, promo: SECOND_PAIR, isNew: true, colors: ['שחור+אדום'], dept: 'boys', url: 'https://www.gali.co.il/boys' },
  '656652': { id: '656652', brand: 'POKIMON', name: 'נעלי ספורט בעיצוב פיקאצ׳ו', price: 199.9, promo: SECOND_PAIR, isNew: true, colors: ['נייבי'], dept: 'boys', url: 'https://www.gali.co.il/boys' },
  '457060': { id: '457060', brand: 'CHICOS', name: 'מגפוני צ׳לסי עם פרח לילדות', price: 199.9, isNew: true, colors: ['ורוד', 'שחור'], dept: 'girls', url: 'https://www.gali.co.il/girls', cutout: true },
  '154077': { id: '154077', brand: 'HUSH PUPPIES', name: 'נעלי נוחות קלאסיות', price: 399.9, colors: ['שחור', 'חום'], dept: 'men', url: 'https://www.gali.co.il/men', cutout: true },
  '544188': { id: '544188', brand: 'HUSH PUPPIES', name: 'נעלי מוקסין עם סוליית טרקטור לגברים', price: 299.9, was: 419.9, saleType: 'FINAL SALE', colors: ['חום', 'שחור'], dept: 'men', url: 'https://www.gali.co.il/men', cutout: true },
  '544186': { id: '544186', brand: 'HUSH PUPPIES', name: 'נעליים אלגנטיות עם שרוכים לגברים', price: 299.9, was: 399.9, saleType: 'FINAL SALE', colors: ['שחור', 'חום'], dept: 'men', url: 'https://www.gali.co.il/men' },
  '449208': { id: '449208', brand: 'BIANCA BALLTI', name: 'סנדלי עקב עם אבנים לנשים', price: 78.9, was: 249.9, saleType: 'FINAL SALE', colors: ['שחור'], dept: 'women', url: 'https://www.gali.co.il/women', cutout: true },
  '445130': { id: '445130', brand: 'BRILL COMFORT', name: 'סנדלי עקב מנצנצים לנשים', price: 149.9, was: 219.9, saleType: 'FINAL SALE', colors: ['בז׳', 'שחור'], dept: 'women', url: 'https://www.gali.co.il/women' },
  '542087': { id: '542087', brand: 'EASY SPIRIT', name: 'נעלי ספורט נוחות סוליה מחוררת לנשים', price: 149.9, was: 449.9, saleType: 'OUTLET', colors: ['שחור', 'ירוק בהיר'], dept: 'women', url: 'https://www.gali.co.il/women' },
  '445175': { id: '445175', brand: 'XTI', name: 'כפכפי אספדריל לנשים', price: 49.9, was: 249.9, saleType: 'OUTLET', colors: ['שחור', 'לבן'], dept: 'women', url: 'https://www.gali.co.il/sale', cutout: true },
  '542210': { id: '542210', brand: 'BIANCA BALLTI', name: 'סנדל אצבע בעיצוב ״טבע״ אנטומי לנשים', price: 99.9, was: 199.9, saleType: 'OUTLET', colors: ['שחור', 'פיוטר'], dept: 'women', url: 'https://www.gali.co.il/sale', cutout: true },
  '540045': { id: '540045', brand: 'ZOEE', name: 'סנדלי טבע מטאליים לילדות', price: 99.9, was: 199.9, saleType: 'OUTLET', colors: ['כסף', 'זהב', 'ורוד', 'כחול'], dept: 'girls', url: 'https://www.gali.co.il/sale', cutout: true },
  '547100': { id: '547100', brand: 'LEE COOPER', name: 'סנדלי יהלומים מטאליים לילדות', price: 98.9, was: 219.9, saleType: 'FINAL SALE', colors: ['שחור', 'כסף'], dept: 'girls', url: 'https://www.gali.co.il/sale', cutout: true },
  '545240': { id: '545240', brand: 'GENERAL', name: 'סנדלים מטאליים עם אבנים לנשים', price: 79.9, was: 199.9, saleType: 'OUTLET', colors: ['כסף', 'שחור'], dept: 'women', url: 'https://www.gali.co.il/sale' },
  '542138': { id: '542138', brand: 'LIGHT EASY', name: 'כפכפי נוחות בשני גוונים לנשים', price: 99.9, was: 199.9, saleType: 'OUTLET', colors: ['ורוד', 'שחור', 'ירוק'], dept: 'women', url: 'https://www.gali.co.il/sale', cutout: true },
};

