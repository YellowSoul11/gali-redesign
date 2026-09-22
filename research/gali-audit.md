# Gali — Audit of the current digital experience

Captured 2026-09-22 from https://www.gali.co.il/ via Playwright (1440px + 390px). Screenshots in `research/screens/`. Raw extracts: `raw-home.json`, `raw-site.json`.

## Who Gali is
- Israeli brand founded **1975**, originally a manufacturer of kids' and sports shoes ("גלי פלייט", "גלי עור כפפה"). Today a **family footwear chain** selling Gali own-label next to international brands (Hush Puppies, Caterpillar, Dockers, Lee Cooper, Dunlop…). Source: /about-gali.
- Part of **Brill** (בריל) group — the header carries a sister-chain switcher: Gali · Lee Cooper · Nine West · Step In · Aldo. Shared loyalty club **Super Friends** across Brill chains.
- Positioning today = accessible value for the whole family: kids licensed characters, comfort, promotions.

## Platform
Magento 2 (theme `Idus/Brill`), server-rendered, Hebrew `lang="he"`, RTL. robots.txt permits crawling.

## Brand identity
| Element | Current state |
|---|---|
| Logo | Green italic script wordmark "Gali" with an accent-like tick over the i. Only served as a 160×75 PNG (no SVG found). |
| Colour | Logo green ≈ `#0E7A3A`-ish; near-black `#1E1E1E` text; `#FAFAFA` header band; black chain bar; sale red (campaign banner, OUTLET labels). Category tiles use soft pastels (mint, sand, sky, blush). |
| Type | **Simpler Pro** (Hebrew/Latin sans, Fontimi) for everything, 15px body, 400/700 only. Latin labels in caps ("NEW COLLECTION", "FINAL SALE"). No real display typography; headlines live inside JPG banners. |
| Imagery | Two worlds: (1) clean packshots on white, 2000×2000 originals, consistent 3/4 angle; (2) studio campaign photography on seamless colour sweeps with plinths/cubes (pink floor, yellow/purple blocks), families & kids, bright and friendly. |

## Navigation architecture
Top: announcement bar ("משלוח חינם בקנייה מעל 199 ש"ח") → black Brill chain switcher + search/account/wishlist/cart → centred logo → primary nav:
**נשים · גברים · בנות · בנים · Outlet · מותגים · NEW · SALE · GIFT CARD · Super Friends**.
Mega-menus show sub-categories plus one 530×340 image per department ("קולקציית קיץ 2026").

Sub-categories (from filters):
- נשים: נעליים שטוחות, סנדלים שטוחים, מגפונים, סניקרס, נעלי ספורט, נעלי עקב, סנדלי עקב, מגפיים, כפכפים, סנדלי שורש, נעלי בית, נעלי מוקסין
- גברים: נעליים נמוכות, נעלי ספורט, סנדלים, סניקרס, נעליים גבוהות, נעלי בית, כפכפים, סנדלי שורש, נעליים טקטיות
- בנות: נעלי ספורט, נעלי בובה וסניקרס, מגפונים, מגפיים, סנדלים שטוחים, סנדלי שורש, נעלי צעד ראשון, מגפי גשם, נעלי בית
- בנים: נעלי ספורט, נעלי כדורגל, סנדלים שטוחים, סנדלי שורש, מגפיים, מגפי גשם, נעלי בית, נעלי צעד ראשון
- Also: אביזרים (socks, towels, undershirts), נעליים תקניות – כוחות הביטחון.

## Homepage (current)
1. Announcement bar · 2. Chain switcher + header · 3. Full-width JPG hero "קולקציית החג עכשיו ב-Gali" (text baked in image) · 4. Second JPG hero "סוף עונה! סנדלים החל מ-49.90 ₪, בתוקף עד 30.9.26" (loud red) · 5. "NEW COLLECTION" product carousel (6 visible, dots) · 6. Super Friends club banner · 7. 2×2 department tiles MEN/WOMEN/BOYS/GIRLS (vertical English words baked into JPGs) · 8. USP row (Secure Payments / Free Delivery / Free Returns — English headings) · 9. @gali_shoes Instagram carousel · 10. "Join Us" newsletter (10% off first purchase) · 11. Footer (4 link columns, payment logos, accessibility widget).

## Listing pages
H1 + short SEO paragraph → sub-category icon carousel (packshot thumbnails) → filter bar (מותג, צבע, סוג פריט, מבצע, מידה, מחיר, sort) → 4-col grid of grey-bg cards. Card: badge (SALE / NEW COLLECTION), brand in caps, Hebrew name, price, strikethrough price, promo line ("זוג שני ב 59.90"), sale type (OUTLET / FINAL SALE), colour swatches, "הוסף לסל".

## Product page
Breadcrumb → 2-up image grid (5 shots: side, front, back, sole, detail) | brand, name, sale-type label, red price + struck price, colour swatches, size boxes (36–41 women, 39–47 men), size chart link, black "בחר מידה" CTA, Super Friends 10% cashback box, accordions (על המוצר / משלוחים והחזרות), SKU and material.

## Promotions observed
- End-of-season: sandals for the whole family from **49.90 ₪** (until 30.9.26)
- **זוג שני ב-59.90** on NEW COLLECTION
- OUTLET / FINAL SALE up to ~70% (e.g. Easy Spirit 449.90 → 149.90)
- Free delivery over 199 ₪ · free returns in stores · Super Friends: 10% back, 49.90 ₪/yr membership, 50 ₪ welcome gift, 20% birthday
- Newsletter: 10% off first purchase

## Strengths
- Genuinely good raw material: 2000px packshots with consistent lighting; a warm, colourful campaign shoot with families.
- Clear department taxonomy; strong promo mechanics; national store network (/stores, regions: אילת, דרום, ירושלים, מרכז, צפון, שפלה, שרון).
- 50-year heritage story — completely unused on the site.

## Problems
1. **Identity is borrowed from JPGs.** All headline typography is baked into banners — not accessible, not responsive, inconsistent (Hebrew display in one, giant English outline letters in another).
2. **Language mix without system.** English UI headings ("Secure Payments", "Join Us", "NEW COLLECTION", "MEN") on a Hebrew site; feels template-driven.
3. **Two competing heroes** stacked; the red sale banner shouts over the brand campaign.
4. **Flat hierarchy.** Everything is 15px Simpler at 400; section titles barely differ from body copy.
5. **Generic carousel-driven layout**; product cards are small, grey boxes, arrows/dots everywhere.
6. **Brand house vs. chain confusion** — the Brill switcher sits above the Gali logo and is the first strong visual element.
7. **Heritage, kids-character licensing, and comfort** — the three things that differentiate Gali — have no storytelling.
8. **Mobile**: stacked banners with unreadable baked text; tiles become tall; lots of scroll before product.
9. Accessibility: images of text, English alt-less labels, overlay accessibility widget instead of native semantics.
