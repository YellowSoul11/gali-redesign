import { Link } from 'react-router';
import type { Crumb } from '../../data/categories';

export function Breadcrumbs({ items, className = '' }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="פירורי לחם" className={`text-[13px] text-ink-3 ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-line">/</span>}
            {c.to ? <Link to={c.to} className="ulink hover:text-ink">{c.label}</Link> : <span aria-current="page" className="text-ink">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
