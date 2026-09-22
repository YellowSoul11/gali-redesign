import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useNavigate, useLocation } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { Drawers } from '../commerce/BagDrawer';
import { BASE, toRoute } from '../../lib/base';

/**
 * Shared shell for every route. Same-origin <a href> clicks are routed client-side, so content
 * components can use plain anchors (and keep working as real links: open in new tab, copy link, SEO).
 */
export function SiteLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || !a.href || a.target || a.hasAttribute('download')) return;
      const url = new URL(a.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return; // in-page anchor
      e.preventDefault();
      navigate(toRoute(url.pathname) + url.search + url.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  // When deployed under a sub-path (GitHub Pages), prefix root-relative hrefs so new-tab / copy-link work too.
  useEffect(() => {
    if (!BASE) return;
    const fix = () => document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((a) => {
      const h = a.getAttribute('href')!;
      if (!h.startsWith(BASE + '/') && h !== BASE && !h.startsWith('//')) a.setAttribute('href', BASE + h);
    });
    fix();
    const mo = new MutationObserver(fix);
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['href'] });
    return () => mo.disconnect();
  }, []);

  // move focus to the new page for screen-reader and keyboard users
  useEffect(() => { document.getElementById('main')?.focus({ preventScroll: true }); }, [pathname]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[100] focus:bg-ink focus:text-paper focus:px-4 focus:py-2">דילוג לתוכן</a>
      <div id="top" />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
      <Drawers />
      <ScrollRestoration />
    </>
  );
}
