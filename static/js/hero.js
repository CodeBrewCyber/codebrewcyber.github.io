/* hero.js — canvas grid + typewriter for codebrewcyber.github.io */

/* ─── Canvas grid ─────────────────────────────────────────────── */
(function () {
  var canvas = document.getElementById('cb-hero-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var CELL = 40;
  var tick = 0;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function draw() {
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var cols = Math.ceil(W / CELL) + 1;
    var rows = Math.ceil(H / CELL) + 1;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = c * CELL;
        var y = r * CELL;
        var wave = Math.sin(tick * 0.03 + c * 0.4 + r * 0.3);
        var alpha = 0.25 + wave * 0.2;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 204, 68, ' + Math.max(0.05, alpha) + ')';
        ctx.fill();
      }
    }

    tick++;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();

/* ─── Typewriter ──────────────────────────────────────────────── */
(function () {
  var el = document.getElementById('cb-hero-name');
  if (!el) return;

  var fullText = el.getAttribute('data-name') || el.textContent.trim();

  /* Lock the element's natural dimensions so the layout never shifts */
  var rect = el.getBoundingClientRect();
  el.style.width    = rect.width  + 'px';
  el.style.height   = rect.height + 'px';
  el.style.display  = 'block';
  el.style.overflow = 'hidden';

  /* Now make it visible and start typing */
  el.style.visibility = 'visible';
  el.textContent = '';

  /* Append a cursor span */
  var cursor = document.createElement('span');
  cursor.className = 'cb-type-cursor';
  cursor.textContent = '|';
  el.appendChild(cursor);

  var i = 0;
  function type() {
    if (i < fullText.length) {
      el.insertBefore(document.createTextNode(fullText[i]), cursor);
      i++;
      setTimeout(type, 60 + Math.random() * 60);
    } else {
      /* Blink a few times then remove the cursor */
      var blinks = 0;
      var blink = setInterval(function () {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        if (++blinks >= 6) {
          clearInterval(blink);
          cursor.remove();
        }
      }, 300);
    }
  }

  /* Small delay so the page paints first */
  setTimeout(type, 200);
})();
