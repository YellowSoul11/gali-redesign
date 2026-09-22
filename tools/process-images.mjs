// Resize product/campaign imagery to WebP and derive alpha cutouts from white-ground packshots.
import sharp from 'sharp';
import fs from 'node:fs';

const P = '../public/assets';
const OUT = `${P}/opt`;
fs.mkdirSync(OUT, { recursive: true });

// product packshots -> 900w webp (cards), alternate angles too
for (const f of fs.readdirSync(`${P}/products`)) {
  const id = f.replace('.jpg', '');
  if (fs.existsSync(`${OUT}/p-${id}.webp`)) continue;
  await sharp(`${P}/products/${f}`).resize(900).webp({ quality: 80 }).toFile(`${OUT}/p-${id}.webp`);
}

// campaign imagery -> 2 widths
for (const f of fs.readdirSync(`${P}/campaigns`).filter((f) => f.endsWith('.jpg'))) {
  const id = f.replace('.jpg', '');
  for (const w of [960, 1920]) {
    if (fs.existsSync(`${OUT}/c-${id}-${w}.webp`)) continue;
    await sharp(`${P}/campaigns/${f}`).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${OUT}/c-${id}-${w}.webp`);
  }
}

// Alpha cutout: flood-fill near-white background from the border, feather the edge.
async function cutout(id, width = 1400) {
  const { data, info } = await sharp(`${P}/products/${id}.jpg`).resize(width).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const bg = new Uint8Array(W * H);
  const isBg = (i) => {
    const r = data[i * C], g = data[i * C + 1], b = data[i * C + 2];
    return Math.min(r, g, b) > 214 && Math.max(r, g, b) - Math.min(r, g, b) < 14;
  };
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const i = stack.pop();
    if (bg[i] || !isBg(i)) continue;
    bg[i] = 1;
    const x = i % W;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (i >= W) stack.push(i - W);
    if (i < W * (H - 1)) stack.push(i + W);
  }
  // RGBA assembled by hand; alpha feathered with a 3x3 box blur
  const rgba = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let s = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy < 0 || yy >= H || xx < 0 || xx >= W) continue;
        s += bg[yy * W + xx] ? 0 : 255; n++;
      }
      rgba[i * 4] = data[i * C]; rgba[i * 4 + 1] = data[i * C + 1]; rgba[i * 4 + 2] = data[i * C + 2];
      rgba[i * 4 + 3] = Math.round(s / n);
    }
  }
  await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .trim({ threshold: 0 })
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(`${OUT}/cut-${id}.webp`);
}
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['655644', '655642', '655653', '154077', '449208', '656648', '657630', '647683', '544188', '445175', '542210', '540045', '547100', '542138', '640060', '457060'];
for (const id of ids) await cutout(id);
console.log('done', fs.readdirSync(OUT).length);
