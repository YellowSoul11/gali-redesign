import { asset } from '../../lib/base';
import { brandLogos, brandHref } from '../../data/brands';
import { SectionHeading } from '../ui/SectionHeading';

export function BrandGrid({ className = '' }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 border-t border-s border-line ${className}`}>
      {brandLogos.map((b) => (
        <li key={b.file} className="border-b border-e border-line">
          <a href={brandHref(b.key)} className="brand-cell grid place-items-center aspect-[3/2] p-[18%]" aria-label={b.name}>
            <img src={asset(`/assets/brands/${b.file}`)} alt={b.name} loading="lazy" className="max-h-full max-w-full object-contain mix-blend-multiply" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Brands() {
  return (
    <section aria-labelledby="brands-title" className="py-20 lg:py-28">
      <div className="shell">
        <SectionHeading id="brands-title" className="mb-10 lg:mb-14" title="המותגים בגלי"
          sub="לצד נעלי גלי: מותגים בינלאומיים כמו Hush Puppies, Caterpillar, Dockers ו-Lee Cooper."
          link={{ to: '/brands', label: 'לכל המותגים' }} />
        <BrandGrid />
      </div>
    </section>
  );
}
