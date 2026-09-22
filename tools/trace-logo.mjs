// Trace the 160x75 Gali PNG wordmark into an SVG path (concept-only reproduction).
import sharp from 'sharp';
import potrace from 'potrace';
import fs from 'node:fs';

const src = '../public/assets/gali/gali_.png';
const meta = await sharp(src).metadata();
console.log(meta.width, meta.height, meta.channels);
// flatten on white, upscale, convert to luminance
const buf = await sharp(src).flatten({ background: '#ffffff' }).resize(meta.width * 10, null, { kernel: 'lanczos3' }).greyscale().blur(3).png().toBuffer();
potrace.trace(buf, { threshold: 170, turdSize: 40, optTolerance: 0.4 }, (err, svg) => {
  if (err) throw err;
  const d = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(' ');
  const vb = svg.match(/viewBox="([^"]+)"/)?.[1] || `0 0 ${meta.width * 10} ${meta.height * 10}`;
  fs.writeFileSync('../src/assets/gali-logo-path.json', JSON.stringify({ viewBox: vb, d }));
  fs.writeFileSync(`${process.env.TEMP}/logo.svg`, svg);
  console.log('ok', vb, d.length);
});
