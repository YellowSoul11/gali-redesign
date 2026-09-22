# PLP / PDP — analysis of the live Gali pages (2026-09-22)

Crawled with Playwright: /women, /men, /girls, /boys, /sale, /new, every department subcategory (first 12 products each), and 617 colour-variant product pages. Raw data: `research/catalog-raw.json`; build: `tools/build-catalog.mjs`.

## Category structure
| Dept | Subcategories (real) |
|---|---|
| נשים | כפכפים, סנדלי שורש, נעלי בית, נעלי מוקסין, נעליים שטוחות, סנדלים שטוחים, מגפונים, סניקרס, נעלי ספורט, נעלי עקב, סנדלי עקב, מגפיים |
| גברים | נעליים נמוכות, נעלי ספורט, סנדלים, סניקרס, נעליים גבוהות, נעלי בית, כפכפים, סנדלי שורש, נעליים טקטיות |
| בנות | נעלי ספורט, נעלי בובה וסניקרס, מגפונים, מגפיים, סנדלים שטוחים, סנדלי שורש, נעלי צעד ראשון, מגפי גשם, נעלי בית |
| בנים | נעלי ספורט, נעלי כדורגל, סנדלים שטוחים, סנדלי שורש, מגפיים, מגפי גשם, נעלי בית, נעלי צעד ראשון |
| SALE | "סוף עונה – סנדלים החל מ-49.90 ₪", OUTLET, + department split |

## Listing page
- Header: H1, breadcrumb (ראשי – נשים), SEO paragraph, subcategory carousel with packshot thumbnails.
- Filters (Magento layered nav): קטגוריה · מותג · צבע (≈40 raw colour names, e.g. בז׳, אבן, מוקה, טאופה) · סוג פריט · מבצע (NEW COLLECTION / זוג שני ב 59.90 / OUTLET / FINAL SALE) · מידה (35–44 incl. half sizes; S–XL) · מחיר (min/max slider, e.g. ₪23–₪551).
- Sort: מיון לפי (position) · שם מוצר · מידה · מחיר מנמוך לגבוה · מחיר מגבוה לנמוך.
- Loading: infinite scroll, 12 per batch.
- Card: SALE / NEW stamp, wishlist, brand (caps), name, price, struck price, promo line, sale type (OUTLET / FINAL SALE), colour swatches + "כמות צבעים לבחירה", quick-shop size swatches + "הוסף לסל". Each colour is a separate card.

## Product page
- Breadcrumb, 4–5 packshots per colour (side, front/back, sole, detail; originals 2000×2000), brand, name, sale type, price / struck price, colour swatches, size boxes (sold-out disabled), "טבלת מידות" drawer (women / men / kids tables EU·US·cm + measuring guide), qty, CTA "בחר מידה" until a size is chosen, Super Friends box ("צוברים 10% מערך הקנייה"), accordions: על המוצר (description, מק"ט, הרכב) and משלוחים והחזרות.
- Shipping (real): free over ₪199 · courier to home ₪24.90 · pickup point/locker ₪14.90 (currently unavailable). Returns: free in stores; return with courier.
- **No reviews and no related-products block** on the live PDP.

## Decisions for the concept
- Keep every real facet; merge the ≈40 raw colour names into colour families for the filter (the product keeps its real colour name).
- One card per style with colour swatches (instead of one card per colour) — cleaner grid, same data.
- Keep the real sorts except "מידה" (sorting by size is not meaningful in a multi-size grid); label default "מומלצים".
- "Load more" with progress instead of infinite scroll (footer stays reachable; position is restorable).
- Related products are a concept addition built only from real catalog items (same subcategory / same brand). No reviews.
- Quick-add sizes on card hover mirror Gali's quick-shop.
