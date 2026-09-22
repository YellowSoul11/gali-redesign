import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon } from './Icon';

/** Section title row used across home, PLP and PDP: heading + supporting line + optional "view all" link. */
export function SectionHeading({ id, title, sub, link, className = '' }: {
  id?: string; title: ReactNode; sub?: ReactNode; link?: { to: string; label: string }; className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-10 gap-y-4 ${className}`}>
      <div>
        <h2 id={id} className="h-section">{title}</h2>
        {sub && <p className="soft mt-3 text-ink-2 text-[17px] max-w-[46ch]">{sub}</p>}
      </div>
      {link && (
        <Link to={link.to} className="inline-flex items-center gap-2 font-semibold">
          <span className="ulink ulink-on">{link.label}</span><Icon name="arrow" className="size-4" />
        </Link>
      )}
    </div>
  );
}
