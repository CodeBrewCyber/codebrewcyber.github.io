/* progress.js — green reading-progress bar on article pages */
(function () {
  if (!document.querySelector('.article-content')) return;

  var bar = document.createElement('div');
  bar.className = 'cb-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  /* Modern browsers: pure CSS scroll-driven animation (see custom.css) */
  if (CSS.supports('animation-timeline: scroll()')) return;

  /* Fallback: passive scroll listener */
  function update() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? doc.scrollTop / max : 0) + ')';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();
