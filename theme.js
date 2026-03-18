/**
 * Color theme picker: swatch click sets body theme and trail accent.
 * Color button click toggles swatches open/closed; click again or pick a swatch to close.
 */
(function () {
  const themeAccents = {
    pink: '#FF99DD',
    default: '#FF99DD',
    gray: '#F64444',
    yellow: '#FFFFFF',
    blue: '#4A44FF'
  };

  function setTheme(themeKey) {
    document.body.classList.remove('theme-gray', 'theme-yellow', 'theme-blue');
    if (themeKey && themeKey !== 'pink' && themeKey !== 'default') {
      document.body.classList.add('theme-' + themeKey);
    }
    var accent = themeAccents[themeKey] || themeAccents.default;
    document.querySelectorAll('.mouse-trail path').forEach(function (path) {
      path.setAttribute('stroke', accent);
    });
  }

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
      if (picker) picker.classList.remove('open');
    });
  });

  document.addEventListener('click', function (e) {
    if (picker && !picker.contains(e.target)) {
      picker.classList.remove('open');
    }
  });
})();
