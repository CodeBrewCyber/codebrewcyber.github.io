/* hero.js — canvas grid + typewriter for codebrewcyber.github.io */

var CB_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Canvas grid ─────────────────────────────────────────────── */
(function () {
  var canvas = document.getElementById('cb-hero-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var CELL = 40;
  var GLOW_RADIUS = 120;
  var GLOW_R2 = GLOW_RADIUS * GLOW_RADIUS;
  var tick = 0;
  var pointerX = -9999, pointerY = -9999;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function drawFrame(animated) {
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var cols = Math.ceil(W / CELL) + 1;
    var rows = Math.ceil(H / CELL) + 1;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = c * CELL;
        var y = r * CELL;
        var alpha = 0.25;
        var radius = 2;

        if (animated) {
          var wave = Math.sin(tick * 0.03 + c * 0.4 + r * 0.3);
          alpha = 0.25 + wave * 0.2;

          /* Brighten dots near the pointer with a distance falloff */
          var dx = x - pointerX, dy = y - pointerY;
          var d2 = dx * dx + dy * dy;
          if (d2 < GLOW_R2) {
            var boost = 1 - Math.sqrt(d2) / GLOW_RADIUS;
            alpha += boost * 0.6;
            radius += boost * 1.5;
          }
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 204, 68, ' + Math.min(1, Math.max(0.05, alpha)) + ')';
        ctx.fill();
      }
    }
  }

  function loop() {
    drawFrame(true);
    tick++;
    requestAnimationFrame(loop);
  }

  resize();

  if (CB_REDUCED_MOTION) {
    drawFrame(false);
    window.addEventListener('resize', function () { resize(); drawFrame(false); });
    return;
  }

  window.addEventListener('resize', resize);

  /* Pointer tracking — only for fine pointers that can hover */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var hero = canvas.parentElement;
    hero.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', function () {
      pointerX = -9999;
      pointerY = -9999;
    });
  }

  loop();
})();

/* ─── Typewriter ──────────────────────────────────────────────── */
(function () {
  var el = document.getElementById('cb-hero-name');
  if (!el) return;

  if (CB_REDUCED_MOTION) {
    /* Name is already in the markup — just reveal it */
    el.style.visibility = 'visible';
    return;
  }

  var fullText = el.getAttribute('data-name') || el.textContent.trim();

  /* Lock only the height so wrapped layouts can't shift vertically
     while text reflows during typing */
  var rect = el.getBoundingClientRect();
  el.style.minHeight = rect.height + 'px';
  el.style.display = 'block';

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
