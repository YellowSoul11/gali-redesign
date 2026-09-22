// One-off: rewrite relative imports after moving components into subfolders.
import fs from 'node:fs';
import path from 'node:path';
const root = '../src/components';
for (const dir of ['layout', 'commerce', 'ui', 'home']) {
  for (const f of fs.readdirSync(path.join(root, dir))) {
    const file = path.join(root, dir, f);
    let t = fs.readFileSync(file, 'utf8');
    t = t.replace(/from '\.\.\/(data|store|hooks|assets|lib)/g, "from '../../$1")
      .replace(/from '\.\/Icon'/g, dir === 'ui' ? "from './Icon'" : "from '../ui/Icon'")
      .replace(/from '\.\/Logo'/g, dir === 'ui' ? "from './Logo'" : "from '../ui/Logo'")
      .replace(/from '\.\/ProductCard'/g, dir === 'commerce' ? "from './ProductCard'" : "from '../commerce/ProductCard'");
    fs.writeFileSync(file, t);
  }
}
console.log('ok');
