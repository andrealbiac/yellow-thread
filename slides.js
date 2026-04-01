const section = document.querySelector('section.gallery');
const galleryCfg = window.yellowThreadGalleryCategories;

/**
 * @type {(number|null)[]} null = gap separator
 */
let slideCategory = [];

function reorderGallerySection(sectionEl, groupIndices) {
  const initial = Array.from(sectionEl.children);
  const n = initial.length;
  const frag = document.createDocumentFragment();
  const categories = [];
  const used = new Set();

  for (let g = 0; g < groupIndices.length; g++) {
    for (const origIdx of groupIndices[g]) {
      if (origIdx < 0 || origIdx >= n) continue;
      const div = initial[origIdx];
      if (!div || used.has(div)) continue;
      used.add(div);
      frag.appendChild(div);
      categories.push(g);
    }
    if (g < groupIndices.length - 1) {
      const gap = document.createElement('div');
      gap.className = 'gallery-gap';
      gap.setAttribute('aria-hidden', 'true');
      frag.appendChild(gap);
      categories.push(null);
    }
  }

  sectionEl.appendChild(frag);
  return categories;
}

if (galleryCfg) {
  slideCategory = reorderGallerySection(section, galleryCfg.GROUP_INDICES);
}

const slides = section.querySelectorAll('div');

section.style.setProperty('--gallery-slide-count', String(slides.length));

let index = 0;
let activeCategoryIndex = 0;

const PATTERN_WEIGHTS = [
  [4, 3, 4],
  [3, 3, 4, 3],
  [3, 4, 3],
  [3, 4, 3, 4],
  [3, 3, 4],
  [4, 3, 3, 3],
  [4, 4, 3],
  [3, 3, 4, 3],
  [4, 3, 4],
  [3, 4, 3, 4],
  [3, 4, 3],
  [4, 3, 3, 3],
  [3, 3, 4],
  [3, 3, 4, 3],
  [4, 4, 3],
  [3, 4, 3, 4],
  [4, 3, 4],
  [4, 3, 3, 3],
  [3, 4, 3],
  [3, 3, 4, 3],
  [3, 3, 4],
  [3, 4, 3, 4],
  [4, 4, 3],
  [4, 3, 3, 3],
  [4, 3, 4],
  [3, 3, 4, 3],
  [3, 4, 3],
  [3, 4, 3, 4],
  [3, 3, 4],
  [4, 3, 3, 3],
  [4, 4, 3],
  [3, 3, 4, 3],
  [4, 3, 4],
  [3, 4, 3, 4],
  [3, 4, 3],
  [4, 3, 3, 3],
  [3, 3, 4],
  [3, 3, 4, 3],
  [4, 4, 3],
  [3, 4, 3, 4],
  [4, 3, 4],
  [4, 3, 3, 3],
  [3, 4, 3],
];

function makeRow(slideCount, start, weights) {
  const row = Array(slideCount).fill(0);
  for (let i = 0; i < weights.length && start + i < slideCount; i++) {
    row[start + i] = weights[i];
  }
  return row;
}

const ORIGINAL_MAX_START = 21;
const EXTENDED_PAIR_PERIOD = 20;

function buildPattern(slideCount) {
  const maxStart = slideCount - 4;
  if (maxStart < 0) {
    return [Array(slideCount).fill(0)];
  }
  const rows = [];
  const W = PATTERN_WEIGHTS;

  if (maxStart <= ORIGINAL_MAX_START) {
    for (let s = 0; s < maxStart; s++) {
      rows.push(makeRow(slideCount, s, W[2 * s]));
      rows.push(makeRow(slideCount, s, W[2 * s + 1]));
    }
    rows.push(makeRow(slideCount, maxStart, W[42]));
    return rows;
  }

  for (let s = 0; s < ORIGINAL_MAX_START; s++) {
    rows.push(makeRow(slideCount, s, W[2 * s]));
    rows.push(makeRow(slideCount, s, W[2 * s + 1]));
  }
  rows.push(makeRow(slideCount, ORIGINAL_MAX_START, W[42]));
  rows.push(makeRow(slideCount, ORIGINAL_MAX_START, W[1]));
  for (let s = ORIGINAL_MAX_START + 1; s < maxStart; s++) {
    const phase = (s - (ORIGINAL_MAX_START + 1)) % EXTENDED_PAIR_PERIOD;
    rows.push(makeRow(slideCount, s, W[2 + 2 * phase]));
    rows.push(makeRow(slideCount, s, W[3 + 2 * phase]));
  }
  rows.push(makeRow(slideCount, maxStart, W[42]));
  return rows;
}

const pattern = buildPattern(slides.length);

const numCategories = galleryCfg ? galleryCfg.CATEGORIES.length : 0;

/** First slide index (after reorder) per category. */
const groupFirstSlideIndex = (() => {
  if (!galleryCfg) return [];
  const out = [];
  for (let g = 0; g < galleryCfg.CATEGORIES.length; g++) {
    const idx = slideCategory.findIndex((c) => c === g);
    out.push(idx >= 0 ? idx : 0);
  }
  return out;
})();

function leftmostVisibleColumn(row) {
  for (let j = 0; j < row.length; j++) {
    if (row[j] > 0) return j;
  }
  return -1;
}

/**
 * Jump target: left edge of the strip is this group’s first image, and every visible
 * column is either that group or a gap (never another group’s image).
 */
function findJumpPatternIndex(groupIdx) {
  const first = groupFirstSlideIndex[groupIdx] ?? 0;

  const isCleanGroupView = (row) => {
    if (leftmostVisibleColumn(row) !== first) return false;
    for (let j = 0; j < row.length; j++) {
      if (row[j] <= 0) continue;
      const cat = slideCategory[j];
      if (cat != null && cat !== groupIdx) return false;
    }
    return true;
  };

  for (let i = 0; i < pattern.length; i++) {
    if (isCleanGroupView(pattern[i])) return i;
  }

  for (let i = 0; i < pattern.length; i++) {
    if (leftmostVisibleColumn(pattern[i]) === first) return i;
  }

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i][first] > 0) return i;
  }
  return 0;
}

const categoryButtons = document.querySelectorAll('.gallery-category');

function resolveActiveCategory(row) {
  const n = numCategories || 4;
  const counts = Array(n).fill(0);
  for (let i = 0; i < row.length; i++) {
    if (row[i] === 0) continue;
    const c = slideCategory[i];
    if (c != null && c >= 0 && c < n) counts[c]++;
  }

  let best = -1;
  let bestScore = -1;
  for (let c = 0; c < n; c++) {
    if (counts[c] >= 2) {
      if (counts[c] > bestScore || (counts[c] === bestScore && (best < 0 || c < best))) {
        bestScore = counts[c];
        best = c;
      }
    }
  }
  if (best >= 0) return best;

  bestScore = -1;
  best = -1;
  for (let c = 0; c < n; c++) {
    if (counts[c] > bestScore || (counts[c] === bestScore && (best < 0 || c < best))) {
      bestScore = counts[c];
      best = c;
    }
  }
  if (best >= 0) return best;
  return activeCategoryIndex;
}

function updateCategoryNav(categoryIndex) {
  activeCategoryIndex = categoryIndex;
  categoryButtons.forEach((btn) => {
    const i = Number(btn.getAttribute('data-category'));
    btn.classList.toggle('is-active', i === categoryIndex);
  });

  if (!galleryCfg || !window.yellowThreadSetTheme) return;
  const theme = galleryCfg.CATEGORIES[categoryIndex]?.theme || 'pink';
  window.yellowThreadSetTheme(theme);
}

const nextSlide = () => {
  index += 1;
  index %= pattern.length;
  applyPattern();
};

const prevSlide = () => {
  index -= 1;
  if (index < 0) index = pattern.length - 1;
  applyPattern();
};

const AUTOPLAY_INTERVAL_MS = 3000;
const AUTOPLAY_RESUME_AFTER_MS = 3000;

let autoplayTimerId = null;
let resumeTimerId = null;

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;

function clearAutoplayTimer() {
  if (autoplayTimerId !== null) {
    clearTimeout(autoplayTimerId);
    autoplayTimerId = null;
  }
}

function clearResumeTimer() {
  if (resumeTimerId !== null) {
    clearTimeout(resumeTimerId);
    resumeTimerId = null;
  }
}

function scheduleAutoplayStep() {
  if (prefersReducedMotion()) return;
  clearAutoplayTimer();
  autoplayTimerId = setTimeout(() => {
    autoplayTimerId = null;
    nextSlide();
    scheduleAutoplayStep();
  }, AUTOPLAY_INTERVAL_MS);
}

function onGalleryInteraction() {
  if (prefersReducedMotion()) return;
  clearAutoplayTimer();
  clearResumeTimer();
  resumeTimerId = setTimeout(() => {
    resumeTimerId = null;
    scheduleAutoplayStep();
  }, AUTOPLAY_RESUME_AFTER_MS);
}

const MOBILE_BREAKPOINT = 768;
const isMobile = () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;

/** Multiplier for gap columns’ `fr` share so separators read narrower than image columns. */
const GAP_FR_SCALE = 0.32;

function gridTrackFr(weight, slideIndex) {
  if (weight === 0) return '0fr';
  const isGap =
    slideCategory.length === slides.length && slideCategory[slideIndex] === null;
  const w = isGap ? weight * GAP_FR_SCALE : weight;
  return `${w}fr`;
}

const applyPattern = () => {
  const row = pattern[index];
  if (isMobile()) {
    section.style.gridTemplateColumns = '1fr';
    section.style.gridTemplateRows = row.map((p, i) => gridTrackFr(p, i)).join(' ');
  } else {
    section.style.gridTemplateColumns = row.map((p, i) => gridTrackFr(p, i)).join(' ');
    section.style.gridTemplateRows = '';
  }
  slides.forEach((slide, slideIndex) => {
    if (pattern[index][slideIndex] === 0) {
      slide.classList.add('hide');
    } else {
      slide.classList.remove('hide');
    }
  });

  if (slideCategory.length === slides.length) {
    updateCategoryNav(resolveActiveCategory(pattern[index]));
  }
};

section.addEventListener('click', () => {
  onGalleryInteraction();
  nextSlide();
});

categoryButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onGalleryInteraction();
    const g = Number(btn.getAttribute('data-category'));
    if (Number.isNaN(g)) return;
    index = findJumpPatternIndex(g);
    applyPattern();
  });
});

let wheelAccum = 0;
const WHEEL_THRESHOLD = 80;
const WHEEL_MIN_INTERVAL_MS = 180;

let lastWheelStepAt = 0;

section.addEventListener(
  'wheel',
  (e) => {
    if (!isMobile()) return;
    e.preventDefault();
    const dy = e.deltaY;
    if (dy === 0) return;
    onGalleryInteraction();
    wheelAccum += dy;
    const now = performance.now();
    if (now - lastWheelStepAt < WHEEL_MIN_INTERVAL_MS) return;

    if (wheelAccum >= WHEEL_THRESHOLD) {
      nextSlide();
      wheelAccum = 0;
      lastWheelStepAt = now;
    } else if (wheelAccum <= -WHEEL_THRESHOLD) {
      prevSlide();
      wheelAccum = 0;
      lastWheelStepAt = now;
    }
  },
  { passive: false }
);

const TOUCH_DRAG_PX_PER_STEP = 44;
const TOUCH_MAX_STEPS_PER_MOVE = 8;

let touchLastY = 0;
let touchDragAccum = 0;

section.addEventListener(
  'touchstart',
  function (e) {
    onGalleryInteraction();
    touchLastY = e.touches[0].clientY;
    touchDragAccum = 0;
  },
  { passive: true }
);

section.addEventListener(
  'touchmove',
  function (e) {
    if (!isMobile()) return;
    e.preventDefault();
    const y = e.touches[0].clientY;
    const dy = touchLastY - y;
    touchLastY = y;
    touchDragAccum += dy;

    let used = 0;
    while (touchDragAccum >= TOUCH_DRAG_PX_PER_STEP && used < TOUCH_MAX_STEPS_PER_MOVE) {
      nextSlide();
      touchDragAccum -= TOUCH_DRAG_PX_PER_STEP;
      used++;
    }
    while (touchDragAccum <= -TOUCH_DRAG_PX_PER_STEP && used < TOUCH_MAX_STEPS_PER_MOVE) {
      prevSlide();
      touchDragAccum += TOUCH_DRAG_PX_PER_STEP;
      used++;
    }
  },
  { passive: false }
);

section.addEventListener('touchend', function () {
  if (!isMobile()) return;
  touchDragAccum = 0;
});

section.addEventListener('touchcancel', function () {
  touchDragAccum = 0;
});

window.addEventListener('resize', applyPattern);

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.key === ' ') {
    event.preventDefault();
    onGalleryInteraction();
    nextSlide();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearAutoplayTimer();
    clearResumeTimer();
  } else if (!prefersReducedMotion()) {
    scheduleAutoplayStep();
  }
});

function warmGalleryImages() {
  const imgs = section.querySelectorAll('img');
  const run = () => {
    imgs.forEach((img) => {
      img.loading = 'eager';
      if (img.decode) {
        img.decode().catch(() => {});
      }
    });
  };
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run, { timeout: 4000 });
  } else {
    setTimeout(run, 200);
  }
}
warmGalleryImages();

applyPattern();
scheduleAutoplayStep();
