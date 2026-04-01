/**
 * Gallery categories: titles, theme keys (pink | gray | yellow | blue), and which original
 * slide index (0-based order in index.html before reorder) belongs to each group.
 * Edit GROUP_INDICES to curate; order within each array is kept when rebuilding the strip.
 */
(function () {
  /** Display order matches theme assignment: one existing site theme per category. */
  const CATEGORIES = [
    { id: 'workshop', title: 'Workshop', theme: 'pink' },
    { id: 'retail', title: 'Retail & spaces', theme: 'gray' },
    { id: 'events', title: 'Events', theme: 'yellow' },
    { id: 'studios', title: 'Studios', theme: 'blue' },
  ];

  function seededShuffle(indices, seed) {
    const a = indices.slice();
    let s = seed >>> 0;
    for (let i = a.length - 1; i > 0; i--) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      const j = s % (i + 1);
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /** Total slides in index gallery (must match markup before reorder). */
  const SLIDE_COUNT = 54;

  const all = Array.from({ length: SLIDE_COUNT }, (_, i) => i);
  const shuffled = seededShuffle(all, 0x9e3779b9);

  const GROUP_INDICES = [
    shuffled.slice(0, 14),
    shuffled.slice(14, 28),
    shuffled.slice(28, 41),
    shuffled.slice(41, 54),
  ];

  window.yellowThreadGalleryCategories = {
    CATEGORIES,
    GROUP_INDICES,
  };
})();
