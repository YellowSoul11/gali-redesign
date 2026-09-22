// One-off: point homepage/header/footer CTAs at the new internal routes (no dead CTAs).
import fs from 'node:fs';
const C = '../src/components/';
const G = 'https://www.gali.co.il';
const files = ['home/Brands.tsx', 'home/Departments.tsx', 'home/Editorial.tsx', 'home/Hero.tsx', 'home/Kids.tsx', 'home/NewCollection.tsx', 'home/SaleStory.tsx', 'layout/Header.tsx'];
const map = [
  [`${G}/gali-brands`, '/brands'], [`${G}/sale/sandals`, '/sale'], [`${G}/women`, '/women'], [`${G}/men`, '/men'],
  [`${G}/girls`, '/girls'], [`${G}/boys`, '/boys'], [`${G}/new`, '/new'], [`${G}/sale`, '/sale'],
];
for (const f of files) {
  let t = fs.readFileSync(C + f, 'utf8');
  for (const [a, b] of map) t = t.split(`"${a}"`).join(`"${b}"`).split(`'${a}'`).join(`'${b}'`);
  fs.writeFileSync(C + f, t);
}
console.log('ok');
