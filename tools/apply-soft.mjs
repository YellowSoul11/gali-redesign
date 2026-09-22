// One-off: apply the secondary (Varela Round) voice to selected supporting/promo copy. Exact-match edits only.
import fs from 'node:fs';
const C = '../src/components/';
const edits = {
  'Hero.tsx': [
    ['<p className="mt-6 text-[17px] lg:text-lg text-ink-2 max-w-[30ch]">', '<p className="soft mt-6 text-[17px] lg:text-lg text-ink-2 max-w-[30ch]">'],
    ['<p className="mt-4 flex items-center gap-2 text-[15px] font-semibold text-gali">', '<p className="soft mt-4 flex items-center gap-2 text-[15px] text-gali">'],
  ],
  'Header.tsx': [['<p className="mx-auto md:mx-0 truncate">', '<p className="soft mx-auto md:mx-0 truncate">']],
  'NewCollection.tsx': [['<p className="mt-3 text-ink-2 text-[17px]">', '<p className="soft mt-3 text-ink-2 text-[17px]">']],
  'Departments.tsx': [['<p className="text-paper/70 text-[17px] max-w-[34ch]">', '<p className="soft text-paper/70 text-[17px] max-w-[34ch]">']],
  'Editorial.tsx': [
    ['className="serif text-[clamp(2.75rem,1.6rem+4vw,5.25rem)] leading-[0.98]"', 'className="display text-[clamp(2.75rem,1.6rem+4vw,5.25rem)]"'],
    ['<em className="not-italic text-gali">', '<em className="soft not-italic text-gali tracking-normal">'],
    ['<p className="mt-6 text-[17px] text-ink-2 max-w-[36ch]">', '<p className="soft mt-6 text-[17px] text-ink-2 max-w-[36ch]">'],
  ],
  'Kids.tsx': [
    ['<span className="serif font-normal tracking-normal">', '<span className="soft">'],
    ['<p className="mt-6 text-[17px] text-ink max-w-[38ch]">', '<p className="soft mt-6 text-[17px] text-ink max-w-[38ch]">'],
  ],
  'SaleStory.tsx': [['<p className="mt-4 text-xl font-medium">', '<p className="soft mt-4 text-xl">']],
  'Brands.tsx': [['<p className="mt-3 text-ink-2 text-[17px] max-w-[46ch]">', '<p className="soft mt-3 text-ink-2 text-[17px] max-w-[46ch]">']],
  'ClubStores.tsx': [
    ['<p className="mt-3 text-lg text-white/85">', '<p className="soft mt-3 text-lg text-white/85">'],
    ['<p className="mt-3 text-lg text-ink-2">', '<p className="soft mt-3 text-lg text-ink-2">'],
  ],
  'Footer.tsx': [
    ['<span className="serif font-normal tracking-normal">', '<span className="soft">'],
    ['<p className="mt-4 text-paper/75 text-[16px] max-w-[40ch]">', '<p className="soft mt-4 text-paper/75 text-[16px] max-w-[40ch]">'],
  ],
};
let n = 0;
for (const [file, pairs] of Object.entries(edits)) {
  let t = fs.readFileSync(C + file, 'utf8');
  for (const [a, b] of pairs) {
    if (!t.includes(a)) { console.log('MISSING', file, a.slice(0, 60)); continue; }
    t = t.replace(a, b); n++;
  }
  fs.writeFileSync(C + file, t);
}
console.log('applied', n);
