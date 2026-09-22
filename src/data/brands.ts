import { catalog, brandSlug } from './catalog';

// Logos as published on gali.co.il/gali-brands; `key` = the brand name as it appears on Gali products.
export const brandLogos: { file: string; name: string; key: string }[] = [
  { file: 'hushpuppies.png', name: 'Hush Puppies', key: 'HUSH PUPPIES' },
  { file: 'cat.png', name: 'Caterpillar', key: 'CATERPILLAR' },
  { file: 'dockers.png', name: 'Dockers', key: 'DOCKERS' },
  { file: 'easyspirit_1.png', name: 'Easy Spirit', key: 'EASY SPIRIT' },
  { file: 'lagear.jpeg', name: 'LA Gear', key: 'LA GEAR' },
  { file: 'nautica.png', name: 'Nautica', key: 'NAUTICA' },
  { file: 'polo.png', name: 'Santa Barbara Polo & Racquet Club', key: 'POLO CLUB' },
  { file: 'lumberjack_logo.jpeg', name: 'Lumberjack', key: 'LUMBERJACK' },
  { file: 'xti-logo.png', name: 'XTI', key: 'XTI' },
  { file: 'brillcomfort.jpeg', name: 'Brill Comfort', key: 'BRILL COMFORT' },
  { file: 'athletics.jpeg', name: 'Athletics', key: 'ATHLETICS' },
  { file: 'studio56.png', name: 'Studio 56', key: 'STUDIO 56' },
];

/** Brand page if Gali products of that brand are in the catalog, otherwise the brands index. */
export const brandHref = (key: string) => (catalog.some((p) => p.brand === key) ? `/brand/${brandSlug(key)}` : '/brands');
