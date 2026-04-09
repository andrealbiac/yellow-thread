/**
 * Gallery categories: titles, theme keys (pink | gray | yellow | blue), and which original
 * slide index (0-based order in index.html before reorder) belongs to each group.
 * index.html lists slides in folder order: Media & retail events, Mock ups, Production for VM, Shoots.
 */
(function () {
  /** Display order matches theme assignment: one existing site theme per category. */
  const CATEGORIES = [
    { id: 'media-retail-events', title: 'Media & retail events', theme: 'pink' },
    { id: 'mock-ups', title: 'Mock ups', theme: 'gray' },
    { id: 'production-vm', title: 'Production for VM', theme: 'yellow' },
    { id: 'shoots', title: 'Shoots', theme: 'blue' },
  ];

  /** Total slides in index gallery (must match markup before reorder). */
  const SLIDE_COUNT = 54;

  function range(start, len) {
    return Array.from({ length: len }, (_, i) => start + i);
  }

  const GROUP_INDICES = [
    range(0, 14),
    range(14, 10),
    range(24, 11),
    range(35, 19),
  ];

  window.yellowThreadGalleryCategories = {
    CATEGORIES,
    GROUP_INDICES,
  };
})();
