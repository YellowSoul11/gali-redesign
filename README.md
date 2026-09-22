# Gali — concept redesign

An **unofficial** concept redesign of the digital flagship of [Gali](https://www.gali.co.il/), the Israeli family footwear chain (est. 1975). Portfolio / showreel project — not affiliated with Gali or Brill.

**Live:** https://yellowsoul11.github.io/gali-redesign/

## What's here
- **Homepage** — editorial campaign hero with a scroll-driven signature interaction (the hero sneaker travels into the "חדש בגלי" collection), department index, editorial, kids, end-of-season sale, brands, Super Friends and stores.
- **Category template (PLP)** — `/women`, `/men`, `/girls`, `/boys`, `/kids`, `/sale`, `/new`, `/brands`, `/category/:slug`, `/brand/:slug`. Real Gali facets (category, size, brand, colour, price, promotion), sorting, URL-synced filters, mobile filter/sort sheets.
- **Product template (PDP)** — gallery + lightbox, colour variants, real sizes with sold-out states, real Gali size charts, add-to-cart feedback and mini-cart.

## Content
All products, prices, promotions, sizes, size charts, shipping/returns copy and imagery come from the public gali.co.il website (captured Sept 2026). Sources: `research/asset-sources.md`; research notes in `research/`. Assets © Gali / their respective owners, used here for a non-commercial concept.

## Stack
React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · GSAP (ScrollTrigger) · Heebo + Varela Round. RTL-first.

```bash
npm install
npm run dev
```

`tools/` holds the Playwright crawlers, the catalog/image build and the interaction test suites.
