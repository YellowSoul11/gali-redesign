// Deploy base ("/" in dev, "/gali-redesign" on GitHub Pages). Root-relative app paths go through these helpers.
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const asset = (p: string) => (p.startsWith('/') ? BASE + p : p);
/** strip the deploy base from a pathname so it can be handed to the router */
export const toRoute = (pathname: string) => (BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname);
