/**
 * Shared theme application (logo, mouse trail, body classes).
 * Index uses category-driven themes; About can load legacy/theme-color-picker.js for manual swatches.
 */
(function () {
  const themeAccents = {
    pink: '#FF99DD',
    default: '#FF99DD',
    gray: '#F64444',
    yellow: '#FFFFFF',
    blue: '#4A44FF',
  };

  const themeLogos = {
    pink: 'img/logo.svg',
    default: 'img/logo.svg',
    gray: 'img/Logo-theme-gray.svg',
    yellow: 'img/Logo-theme-yellow.svg',
    blue: 'img/Logo-theme-blue.svg',
  };

  var STORAGE_KEY = 'yellow-thread-theme';

  function setTheme(themeKey) {
    document.body.classList.remove('theme-gray', 'theme-yellow', 'theme-blue');
    if (themeKey && themeKey !== 'pink' && themeKey !== 'default') {
      document.body.classList.add('theme-' + themeKey);
      try {
        localStorage.setItem(STORAGE_KEY, themeKey);
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
    var accent = themeAccents[themeKey] || themeAccents.default;
    document.querySelectorAll('.mouse-trail path').forEach(function (path) {
      path.setAttribute('stroke', accent);
    });

    var nextLogo = themeLogos[themeKey] || themeLogos.default;
    var logo = document.querySelector('.site-logo');
    if (!logo) return;

    if (logo.tagName !== 'IMG') {
      logo.style.opacity = '1';
      return;
    }

    var fileName = function (path) {
      var p = path || '';
      var i = p.lastIndexOf('/');
      return i >= 0 ? p.slice(i + 1) : p;
    };

    if (document.body.classList.contains('page-home')) {
      var curFile = fileName(logo.getAttribute('src'));
      var nextFile = fileName(nextLogo);
      if (curFile !== nextFile) {
        logo.style.opacity = '0.42';
        var preload = new Image();
        preload.onload = function () {
          logo.setAttribute('src', nextLogo);
          requestAnimationFrame(function () {
            logo.style.opacity = '1';
          });
        };
        preload.onerror = function () {
          logo.setAttribute('src', nextLogo);
          logo.style.opacity = '1';
        };
        preload.src = nextLogo;
        return;
      }
    }

    logo.setAttribute('src', nextLogo);
    logo.style.opacity = '1';
  }

  window.yellowThreadSetTheme = setTheme;

  (function restoreTheme() {
    if (!document.body.classList.contains('page-about')) return;
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      if (nav && nav.type === 'reload') return;
      var t = localStorage.getItem('yellow-thread-theme');
      if (t && t !== 'pink' && t !== 'default') setTheme(t);
    } catch (e) {}
  })();
})();
