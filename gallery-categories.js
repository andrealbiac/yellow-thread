/**
 * Gallery categories: titles, theme keys (pink | gray | yellow | blue), and which original
 * slide index (0-based order in index.html before reorder) belongs to each group.
 * index.html lists slides in folder order: media-retail-events, mock-ups, production-for-vm, shoots.
 * Category nav order differs: Shoots first, then media, mock, production — themes stay pink→gray→yellow→blue.
 */
(function () {
  /** Nav order; themes are fixed per position (1st pink, 2nd gray, 3rd yellow, 4th blue). */
  const CATEGORIES = [
    { id: 'shoots', title: 'Shoots', theme: 'pink' },
    { id: 'media-retail-events', title: 'Media & retail events', theme: 'gray' },
    { id: 'mock-ups', title: 'Mock ups', theme: 'yellow' },
    { id: 'production-for-vm', title: 'Production for VM', theme: 'blue' },
  ];

  /** Total slides in index gallery (must match markup before reorder). */
  const SLIDE_COUNT = 54;

  function range(start, len) {
    return Array.from({ length: len }, (_, i) => start + i);
  }

  const GROUP_INDICES = [
    range(35, 19),
    range(0, 14),
    range(14, 10),
    range(24, 11),
  ];

  window.yellowThreadGalleryCategories = {
    CATEGORIES,
    GROUP_INDICES,
  };
})();
