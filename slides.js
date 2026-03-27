const section = document.querySelector('section.gallery');
const slides = section.querySelectorAll('div');

/** Keeps default CSS `grid-template-columns` in sync so you only add/remove slides in HTML. */
section.style.setProperty('--gallery-slide-count', String(slides.length));

let index = 0;

/**
 * One row of fr weights per “step” (same rhythm as the original 25-slide design).
 * Each entry is the visible slice only; zeros fill the rest of the row per slide index.
 */
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

/** N = 25 → maxStart = 21; first segment matches the hand-tuned matrix exactly. */
const ORIGINAL_MAX_START = 21;
/** After the bridge at s = 21, repeat the W[2]…W[41] pair rhythm (period 20) so each pair stays 3-then-4 wide — avoids W[1]→W[2] at a large start, which shrinks the right edge and looks like a jump backward. */
const EXTENDED_PAIR_PERIOD = 20;

/**
 * Same stepping logic as the original 25-slide matrix for slideCount ≤ 25.
 * For wider galleries, continue with a phase reset so visible columns never creep backward on the right.
 */
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

/** Pause timed advance and restart it after a quiet period (any gallery interaction). */
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

const applyPattern = () => {
  if (isMobile()) {
    section.style.gridTemplateColumns = '1fr';
    section.style.gridTemplateRows = pattern[index].map((p) => `${p}fr`).join(' ');
  } else {
    section.style.gridTemplateColumns = pattern[index].map((p) => `${p}fr`).join(' ');
    section.style.gridTemplateRows = '';
  }
  slides.forEach((slide, slideIndex) => {
    if (pattern[index][slideIndex] === 0) {
      slide.classList.add('hide');
    } else {
      slide.classList.remove('hide');
    }
  });
};

section.addEventListener('click', () => {
  onGalleryInteraction();
  nextSlide();
});

let wheelAccum = 0;
/** Scroll delta before one step; lower than the anti-gap tuning, softer to use. */
const WHEEL_THRESHOLD = 80;
/** Short pause between wheel-driven steps so fades can read softly without machine-gun advances. */
const WHEEL_MIN_INTERVAL_MS = 180;

let lastWheelStepAt = 0;

section.addEventListener(
  'wheel',
  (e) => {
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

/** Mobile: smaller = easier to start a swipe advance. */
const SWIPE_THRESHOLD = 28;
/** Extra pixels beyond threshold → one more slide (longer swipe passes several steps). */
const SWIPE_DISTANCE_PER_STEP = 52;
const SWIPE_MAX_STEPS = 8;

let touchStartY = 0;

section.addEventListener(
  'touchstart',
  function (e) {
    onGalleryInteraction();
    touchStartY = e.touches[0].clientY;
  },
  { passive: true }
);

section.addEventListener(
  'touchmove',
  function (e) {
    if (isMobile()) e.preventDefault();
  },
  { passive: false }
);

section.addEventListener(
  'touchend',
  function (e) {
    if (!isMobile()) return;
    const delta = touchStartY - e.changedTouches[0].clientY;
    const abs = Math.abs(delta);
    if (abs <= SWIPE_THRESHOLD) return;

    const along = abs - SWIPE_THRESHOLD;
    const steps = Math.min(SWIPE_MAX_STEPS, 1 + Math.floor(along / SWIPE_DISTANCE_PER_STEP));

    if (delta > 0) {
      for (let i = 0; i < steps; i++) nextSlide();
    } else {
      for (let i = 0; i < steps; i++) prevSlide();
    }
  },
  { passive: true }
);

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

/** Decode all gallery bitmaps during idle time so first paint after a scroll step is not waiting on the GPU. */
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
