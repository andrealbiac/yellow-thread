/**
 * Optional manual colour picker (footer swatches). Load after theme-core.js.
 * Fragment kept from the original theme.js for pages that still include .color-picker markup.
 */
(function () {
  var picker = document.querySelector('.color-picker');
  var colorBtn = document.querySelector('.color-btn');
  var setTheme = window.yellowThreadSetTheme;
  if (!setTheme) return;

  if (colorBtn && picker) {
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

  document.addEventListener(
    'click',
    function (e) {
      if (!picker || picker.contains(e.target)) return;
      picker.classList.remove('open');
    },
    true
  );
})();
