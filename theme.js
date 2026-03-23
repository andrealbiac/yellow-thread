/**
 * Color theme picker: swatch applies theme and leaves the menu open; close via button or outside click.
 */
(function () {
  const themeAccents = {
    pink: '#FF99DD',
    default: '#FF99DD',
    gray: '#F64444',
    yellow: '#FFFFFF',
    blue: '#4A44FF'
  };

  const themeLogos = {
    pink: 'img/logo.svg',
    default: 'img/logo.svg',
    gray: 'img/Logo-theme-gray.svg',
    yellow: 'img/Logo-theme-yellow.svg',
    blue: 'img/Logo-theme-blue.svg'
  };

  var STORAGE_KEY = 'yellow-thread-theme';

  function setTheme(themeKey) {
    document.body.classList.remove('theme-gray', 'theme-yellow', 'theme-blue');
    if (themeKey && themeKey !== 'pink' && themeKey !== 'default') {
      document.body.classList.add('theme-' + themeKey);
      try { localStorage.setItem(STORAGE_KEY, themeKey); } catch (e) {}
    } else {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }
    var accent = themeAccents[themeKey] || themeAccents.default;
    document.querySelectorAll('.mouse-trail path').forEach(function (path) {
      path.setAttribute('stroke', accent);
    });
    var logo = document.querySelector('.site-logo');
    if (logo) logo.src = themeLogos[themeKey] || themeLogos.default;
  }

  (function restoreTheme() {
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      if (nav && nav.type === 'reload') return;
      var t = localStorage.getItem(STORAGE_KEY);
      if (t && t !== 'pink' && t !== 'default') setTheme(t);
    } catch (e) {}
  })();

  var picker = document.querySelector('.color-picker');
  var colorBtn = document.querySelector('.color-btn');
  if (colorBtn) {
    colorBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      picker.classList.toggle('open');
    });
  }

  document.querySelectorAll('.color-swatches .swatch').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      setTheme(btn.getAttribute('data-theme'));
    });
  });

  /* Capture: run before target so outside-click close never races the button toggle */
  document.addEventListener(
    'click',
    function (e) {
      if (!picker || picker.contains(e.target)) return;
      picker.classList.remove('open');
    },
    true
  );
})();
