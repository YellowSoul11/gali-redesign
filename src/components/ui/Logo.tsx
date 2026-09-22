import logo from '../../assets/gali-logo-path.json';

/** Gali wordmark — vector trace of the public 160×75 PNG (concept reproduction). */
export function Logo({ className = '', title = 'גלי – לדף הבית' }: { className?: string; title?: string }) {
  return (
    <svg viewBox={logo.viewBox} className={className} role="img" aria-label={title} fill="currentColor">
      <path d={logo.d} fillRule="evenodd" />
    </svg>
  );
}
