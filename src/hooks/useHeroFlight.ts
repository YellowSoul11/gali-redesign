import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Signature interaction: the hero sneaker is one physical object. As the visitor scrolls,
 * it leaves the campaign composition and settles into its slot as the lead product of “חדש בגלי”.
 * Scroll-scrubbed (reversible), transform-only. Disabled under prefers-reduced-motion —
 * both slots then render their own static image.
 */
export function useHeroFlight(stage: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = stage.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const from = root.querySelector<HTMLElement>('[data-flight-from]');
    const to = root.querySelector<HTMLElement>('[data-flight-to]');
    const fly = root.querySelector<HTMLElement>('[data-flyer]');
    if (!from || !to || !fly) return;

    // Unrotated geometry: bounding boxes of rotated boxes are inflated, so use centre + offset size.
    const geo = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const s = root.getBoundingClientRect();
      return { cx: r.left + r.width / 2 - s.left, cy: r.top + r.height / 2 - s.top, w: el.offsetWidth, h: el.offsetHeight };
    };
    let A = geo(from), B = geo(to);
    const place = () => {
      gsap.set(fly, { clearProps: 'transform' });
      A = geo(from); B = geo(to);
      Object.assign(fly.style, { left: `${A.cx - A.w / 2}px`, top: `${A.cy - A.h / 2}px`, width: `${A.w}px`, height: `${A.h}px` });
    };
    place();
    root.classList.add('is-flying');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: () => `top ${root.getBoundingClientRect().top + window.scrollY}px`,
          endTrigger: to,
          end: 'center 55%',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefreshInit: place,
          // hand off to the in-card image once landed (the card is sticky; the flyer is not)
          onUpdate: (self) => root.classList.toggle('is-landed', self.progress > 0.995),
        },
      });
      // Horizontal travel and the settle-to-level rotation lead; vertical drop and scale follow —
      // the two eases give the path a slight arc rather than a straight diagonal.
      tl.fromTo(fly, { x: 0, rotation: -9 }, { x: () => B.cx - A.cx, rotation: 0, ease: 'power2.inOut', duration: 1 }, 0)
        .fromTo(fly, { y: 0, scale: 1 }, { y: () => B.cy - A.cy, scale: () => B.w / A.w, ease: 'power1.inOut', duration: 1 }, 0);
    }, root);

    // layout shifts (tabs, fonts, lazy images) → re-measure
    let t = 0;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = window.setTimeout(() => ScrollTrigger.refresh(), 120); });
    ro.observe(root);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => { ro.disconnect(); ctx.revert(); root.classList.remove('is-flying', 'is-landed'); };
  }, [stage]);
}
