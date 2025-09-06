// Mirrors Salient's salient-portfolio.js behavior:
// - Isotope engine, Packery layout
// - Elastic column tiers with "photography" +1 col behavior
// - Width "fudge factor" to avoid subpixel gaps
// - No sorting: DOM order is preserved
// - Filters via data-starting-filter and button clicks
// - imagesLoaded relayouts; resize relayout; RTL aware
// - Column-based reveal staggering (z-index/delay by column)

import Isotope from 'isotope-layout';
import 'packery'; // registers packery as a layout mode on window
import imagesLoaded from 'imagesloaded';

type MasonryOpts = {
  container: string;
  options?: {
    gutter?: number;
    elastic?: boolean;
    photographyMode?: boolean;
    constrained?: boolean;
    boxedLayout?: boolean;
    masonryType?: 'photography' | 'default';
    startingFilter?: string;
    rtl?: boolean;
  };
};

export default function initMasonry(cfg: MasonryOpts) {
  const el = document.querySelector(cfg.container) as HTMLElement | null;
  if (!el) return;

  const data = (attr: string, fallback?: string) => el.getAttribute(attr) ?? fallback ?? '';
  const pxGutter = parseInt((data('data-gutter') ?? '0').replace('px',''), 10) || (cfg.options?.gutter ?? 0);
  const startingFilter = data('data-starting-filter', cfg.options?.startingFilter ?? '*');
  const masonryType = (data('data-masonry-type') as 'photography'|'default') ?? (cfg.options?.masonryType ?? 'default');
  const constrained = (data('data-constrained') === '1') || !!cfg.options?.constrained;
  const elastic = (data('data-col-num') === 'elastic') || !!cfg.options?.elastic;
  const rtl = cfg.options?.rtl ?? (document.dir === 'rtl');

  // Column tier selection (matches Salient's behavior)
  function pickCols(containerWidth: number): number {
    // Defaults
    let cols: number;
    const boxed = !!cfg.options?.boxedLayout;

    if (containerWidth > 1600) cols = 5;
    else if (containerWidth > 1300) cols = 4;
    else if (containerWidth > 990) cols = 3;
    else if (containerWidth > 470) cols = 2;
    else cols = 1;

    // Constrained tweaks (Salient nudges tiers smaller/larger at certain ranges)
    if (constrained) {
      if (containerWidth > 1600) cols = Math.max(1, cols - 1); // five→four
      else if (containerWidth > 1300) cols = Math.max(1, cols - 1); // four→three
      else if (containerWidth > 990) cols = Math.min(4, cols + 1); // three→four
    }

    if (boxed) cols = Math.max(1, Math.min(cols, 3)); // boxy layouts tend to reduce tiers

    if (masonryType === 'photography' && cols >= 3) cols += 1; // +1 at larger tiers
    return cols;
  }

  // Width with fudge factor so columns divide cleanly (avoids subpixel seams)
  function computeItemWidth(containerWidth: number, cols: number): number {
    const gutterTotal = pxGutter * (cols - 1);
    let base = (containerWidth - gutterTotal) / cols;

    // Fudge: try to nudge width so total is integer px
    const maxFudge = containerWidth < 640 ? 3 : 6;
    for (let i = 0; i <= maxFudge; i++) {
      const test = Math.floor((containerWidth - i - gutterTotal) / cols);
      if (((containerWidth - i - gutterTotal) % cols) === 0) {
        base = test;
        break;
      }
    }
    return Math.floor(base);
  }

  // Apply widths per variant; heights will be normalized after images load
  function applySizes() {
    const rect = el.getBoundingClientRect();
    const cols = elastic ? pickCols(rect.width) : 3;
    const w = computeItemWidth(rect.width, cols);
    const sizer = el.querySelector('.grid-sizer') as HTMLElement | null;
    if (sizer) sizer.style.width = `${w}px`;

    const items = Array.from(el.querySelectorAll<HTMLElement>('.masonry-item'));
    for (const it of items) {
      const variant = it.classList.contains('wide_tall') ? 'wide_tall'
                    : it.classList.contains('wide') ? 'wide'
                    : it.classList.contains('tall') ? 'tall'
                    : 'regular';
      const mult = (variant === 'wide' || variant === 'wide_tall') ? 2 : 1;
      const widthPx = mult === 2 && cols > 1 ? (w * 2 + pxGutter) : w;
      it.style.width = `${widthPx}px`;
      it.style.marginInlineEnd = `${pxGutter}px`;
      it.style.marginBlockEnd  = `${pxGutter}px`;
    }
  }

  // Height normalization like Salient: choose a reference height per column type
  function normalizeHeights() {
    const visible = Array.from(el.querySelectorAll<HTMLElement>('.masonry-item'))
      .filter(n => !n.classList.contains('isotope-hidden'));
    if (visible.length === 0) return;

    // Reference = average of visible regular or fallback to first image height
    let ref = 0, count = 0;
    for (const n of visible) {
      const img = n.querySelector('img') as HTMLImageElement | null;
      if (!img || !img.complete || !img.naturalHeight) continue;
      const isRegularish = n.classList.contains('regular') || n.classList.contains('wide');
      if (isRegularish) { ref += img.getBoundingClientRect().height; count++; }
    }
    if (count === 0) {
      const first = visible.find(n => (n.querySelector('img') as HTMLImageElement)?.complete);
      if (first) ref = (first.querySelector('img') as HTMLImageElement).getBoundingClientRect().height;
    } else {
      ref = ref / count;
    }
    if (!ref || !isFinite(ref)) return;

    for (const n of visible) {
      const tall = n.classList.contains('tall') || n.classList.contains('wide_tall');
      const target = tall ? (ref * 2 + pxGutter) : ref;
      n.style.height = `${Math.round(target)}px`;
      const img = n.querySelector('img') as HTMLImageElement | null;
      if (img) {
        img.style.height = '100%';
        img.style.objectFit = 'cover'; // emulate cropping behavior
      }
    }
  }

  // Reveal staggering per column (does not change order)
  function applyStagger(iso: Isotope) {
    // After layout, compute unique x positions → delays
    const laidOut = iso.getItemElements().filter((e: any) => !e.classList.contains('isotope-hidden'));
    const xs = Array.from(new Set(laidOut.map(el => Math.round((el as HTMLElement).offsetLeft)))).sort((a,b) => a-b);
    const delayPerCol = 60; // ms
    for (const elx of laidOut) {
      const idx = xs.indexOf(Math.round((elx as HTMLElement).offsetLeft));
      const delay = Math.max(0, idx) * delayPerCol;
      (elx as HTMLElement).style.transitionDelay = `${delay}ms`;
      elx.classList.add('animated-in');
    }
  }

  // Init Isotope (layoutMode = packery)
  const iso = new Isotope(el, {
    itemSelector: '.masonry-item',
    layoutMode: 'packery',
    percentPosition: false, // we're assigning explicit px widths
    originLeft: !rtl,
    transitionDuration: '0.35s',
    getSortData: {}, // no sortBy → DOM order preserved
  });

  // Initial sizing + imagesLoaded
  applySizes();
  imagesLoaded(el, { background: false }, () => {
    normalizeHeights();
    iso.arrange({ filter: startingFilter });
    iso.on('arrangeComplete', () => applyStagger(iso));
    iso.layout();
  });

  // Relayout on each image as it finishes
  imagesLoaded(el).on('progress', () => {
    normalizeHeights();
    iso.layout();
  });

  // Resize handling
  let resizeTO: number | undefined;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTO);
    resizeTO = window.setTimeout(() => {
      applySizes();
      normalizeHeights();
      iso.layout();
    }, 100);
  });

  // Filter clicks (matches Salient's .portfolio-filters/buttons with data-filter)
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest<HTMLElement>('[data-filter]');
    if (!target) return;
    e.preventDefault();
    const selector = target.getAttribute('data-filter') ?? '*';
    // update active class UI if you have it
    const siblings = document.querySelectorAll('[data-filter].active');
    siblings.forEach(n => n.classList.remove('active'));
    target.classList.add('active');

    // arrange → relayout → restagger
    iso.arrange({ filter: selector });
    iso.once('arrangeComplete', () => {
      normalizeHeights();
      applyStagger(iso);
    });
  });
}