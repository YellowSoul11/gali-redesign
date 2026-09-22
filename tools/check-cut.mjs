// Preview cutouts on a coloured ground to judge matte quality.
import sharp from 'sharp';
const ids = process.argv.slice(2);
const tiles = await Promise.all(ids.map((id) => sharp(`../public/assets/opt/cut-${id}.webp`).resize(500, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()));
await sharp({ create: { width: 500 * ids.length, height: 400, channels: 3, background: '#E8B7BE' } })
  .composite(tiles.map((t, i) => ({ input: t, left: i * 500, top: 0 })))
  .png().toFile(`${process.env.TEMP}/cut.png`);
