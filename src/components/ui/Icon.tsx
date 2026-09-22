// One authored icon set: 24px grid, 1.5 stroke, round joins.
const paths = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 20.5c1.4-3.6 4.4-5.5 8-5.5s6.6 1.9 8 5.5" /></>,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />,
  bag: <><path d="M5 8h14l-1 12.5H6L5 8Z" /><path d="M9 10V6.5a3 3 0 0 1 6 0V10" /></>,
  menu: <><path d="M3.5 7h17" /><path d="M3.5 12h17" /><path d="M3.5 17h11" /></>,
  close: <><path d="m5.5 5.5 13 13" /><path d="m18.5 5.5-13 13" /></>,
  // RTL: "forward" points left
  arrow: <><path d="M20 12H4.5" /><path d="m10 6-6 6 6 6" /></>,
  chevron: <path d="m15 6-6 6 6 6" />,
  down: <path d="m6 9.5 6 6 6-6" />,
  pin: <><path d="M12 21s6.5-6 6.5-11.2a6.5 6.5 0 0 0-13 0C5.5 15 12 21 12 21Z" /><circle cx="12" cy="9.8" r="2.3" /></>,
  truck: <><path d="M2.5 6.5h11v10h-11z" /><path d="M13.5 10h4l3 3.2v3.3h-7" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
  returns: <><path d="M4 9h11.5a4.5 4.5 0 0 1 0 9H9" /><path d="m8 5-4 4 4 4" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  sliders: <><path d="M4 7h9" /><path d="M17 7h3" /><circle cx="15" cy="7" r="2" /><path d="M4 17h3" /><path d="M11 17h9" /><circle cx="9" cy="17" r="2" /></>,
  sort: <><path d="M8 5v14" /><path d="m4.5 15.5 3.5 3.5 3.5-3.5" /><path d="M16 19V5" /><path d="m12.5 8.5 3.5-3.5 3.5 3.5" /></>,
  ruler: <><path d="M3.5 15.5 15.5 3.5l5 5-12 12z" /><path d="m7.5 11.5 2 2" /><path d="m10.5 8.5 2 2" /><path d="m13.5 5.5 2 2" /></>,
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = 'size-6', label }: { name: IconName; className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label}>
      {paths[name]}
    </svg>
  );
}
