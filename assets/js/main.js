(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var saver = !!(navigator.connection && navigator.connection.saveData);
  var small = function () { return innerWidth < 700; };
  var $ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- navigation ---------- */
  var header = $('.site-header')[0], btn = $('.menu-btn')[0], nav = d.getElementById('nav');
  $('a', nav).forEach(function (a, i) { a.style.setProperty('--i', i); });
  function setMenu(open) {
    d.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', function () { setMenu(!d.body.classList.contains('menu-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  addEventListener('resize', function () { if (innerWidth > 960) setMenu(false); });

  /* ---------- word-split headlines + scroll-filled paragraphs ---------- */
  function wrapWords(el, cls, nested) {
    var i = 0;
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = d.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { f.appendChild(d.createTextNode(' ')); return; }
            var inner = d.createElement('span'); inner.className = cls; inner.style.setProperty('--i', i++); inner.textContent = t;
            if (nested) { var o = d.createElement('span'); o.className = 'w'; o.appendChild(inner); f.appendChild(o); } else f.appendChild(inner);
          });
          n.replaceChild(f, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
  }
  $('[data-split]').forEach(function (el) { wrapWords(el, 'wi', true); });
  var fills = $('[data-fill]').map(function (el) { wrapWords(el, 'fw', false); return { el: el, w: $('.fw', el) }; });

  /* ---------- reveal on view ---------- */
  var revealEls = $('.reveal,.clip,.rule,[data-split]:not([data-now])');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else revealEls.forEach(function (el) { el.classList.add('in'); });

  var hero = $('.hero')[0];
  requestAnimationFrame(function () {
    $('[data-now]').forEach(function (el) { el.classList.add('in'); });
    if (hero) hero.classList.add('ready');
  });

  /* ---------- scroll system: progress, header, parallax, fills, back-to-top ---------- */
  var bar = d.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true'); d.body.appendChild(bar);
  var top = d.createElement('button'); top.className = 'to-top'; top.type = 'button'; top.setAttribute('aria-label', 'Back to top'); top.textContent = '↑'; d.body.appendChild(top);
  top.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  var para = $('[data-speed]').map(function (el) { return { el: el, s: parseFloat(el.getAttribute('data-speed')) || 0, y: 0 }; });
  var ticking = false;
  function frame() {
    ticking = false;
    var y = scrollY, max = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
    header.classList.toggle('solid', y > 40);
    top.classList.toggle('show', y > 900);
    if (!reduce) {
      var k = small() ? .4 : 1;
      para.forEach(function (p) {
        var r = p.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        var base = r.top - p.y;                       // position without our own transform
        p.y = (base + r.height / 2 - innerHeight / 2) * p.s * k;
        p.el.style.setProperty('--py', p.y.toFixed(1) + 'px');
      });
    }
    fills.forEach(function (f) {
      var r = f.el.getBoundingClientRect();
      var prog = reduce ? 1 : Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
      var n = Math.round(prog * f.w.length);
      f.w.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); frame();

  /* ---------- videos: autoplay muted, recover from blocked playback, lazy-load the rest ---------- */
  var blocked = [];
  function tryPlay(v) {
    v.muted = true; v.defaultMuted = true; v.setAttribute('playsinline', '');
    var p = v.play();
    if (p && p.catch) p.catch(function () { if (blocked.indexOf(v) < 0) blocked.push(v); });
  }
  function retryBlocked() { var list = blocked.splice(0); list.forEach(tryPlay); }
  ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) { addEventListener(ev, retryBlocked, { passive: true }); });
  d.addEventListener('visibilitychange', function () { if (!d.hidden) retryBlocked(); });

  var motionOK = !reduce && !saver;
  var lazy = $('video[data-src]');
  if (lazy.length) {
    if (!motionOK || !('IntersectionObserver' in window)) { /* poster stays */ }
    else {
      var vio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var v = e.target;
          if (e.isIntersecting) {
            if (!v.getAttribute('src')) { v.src = v.getAttribute('data-src'); v.load(); }
            tryPlay(v);
          } else if (v.getAttribute('src')) v.pause();
        });
      }, { rootMargin: '300px 0px' });
      lazy.forEach(function (v) { vio.observe(v); });
    }
  }

  /* ---------- desktop-only: cursor, magnetic buttons, product tilt ---------- */
  if (fine && !reduce) {
    var dot = d.createElement('div'), ring = d.createElement('div');
    dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
    d.body.appendChild(dot); d.body.appendChild(ring);
    var mx = 0, my = 0, rx = 0, ry = 0, raf = 0;
    var move = function () {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      raf = (Math.abs(mx - rx) + Math.abs(my - ry) > .3) ? requestAnimationFrame(move) : 0;
    };
    addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      d.body.classList.add('cursor-on');
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      if (!raf) raf = requestAnimationFrame(move);
      d.body.classList.toggle('cursor-hover', !!e.target.closest('a,button,select,summary,.slider,[data-tilt]'));
    }, { passive: true });
    d.addEventListener('mouseleave', function () { d.body.classList.remove('cursor-on'); });

    $('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * .32).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
    $('[data-tilt]').forEach(function (s) {
      s.addEventListener('pointermove', function (e) {
        var r = s.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        s.style.setProperty('--ry', (x * 14).toFixed(1) + 'deg'); s.style.setProperty('--rx', (-y * 12).toFixed(1) + 'deg');
      });
      s.addEventListener('pointerleave', function () { s.style.setProperty('--rx', '0deg'); s.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- campaign slider: crossfade + directional entrance, progress bars, swipe, keyboard ---------- */
  $('[data-slider]').forEach(function (s) {
    var slides = $('.slide', s), bars = $('.bar', s), cur = $('[data-cur]', s)[0];
    var iv = parseInt(s.getAttribute('data-interval'), 10) || 6500, idx = 0, inView = true;
    s.style.setProperty('--iv', iv + 'ms');
    if (reduce) s.classList.add('manual');
    function show(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (sl, i) {
        var on = i === idx;
        sl.classList.toggle('is-active', on);
        sl.setAttribute('aria-hidden', on ? 'false' : 'true');
        if ('inert' in sl) sl.inert = !on;
        $('img', sl).forEach(function (im) { if (on) im.loading = 'eager'; });
      });
      bars.forEach(function (b, i) {
        b.classList.remove('is-active', 'done');
        b.setAttribute('aria-selected', i === idx);
        if (i < idx) b.classList.add('done');
      });
      void s.offsetWidth;                       // restart the progress animation
      bars[idx].classList.add('is-active');
      if (cur) cur.textContent = ('0' + (idx + 1)).slice(-2);
    }
    bars.forEach(function (b, i) {
      b.addEventListener('click', function () { show(i); });
      b.addEventListener('animationend', function () { if (b.classList.contains('is-active') && !s.classList.contains('manual')) show(idx + 1); });
    });
    $('[data-slide]', s).forEach(function (b) {
      b.addEventListener('click', function () { show(idx + (b.getAttribute('data-slide') === 'next' ? 1 : -1)); });
    });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
    });
    // pause while hovered, focused, off-screen or tab hidden
    function sync() { s.classList.toggle('paused', !inView || d.hidden || s.matches(':hover') || s.matches(':focus-within')); }
    s.addEventListener('pointerenter', sync); s.addEventListener('pointerleave', sync);
    s.addEventListener('focusin', sync); s.addEventListener('focusout', sync);
    d.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { inView = e[0].isIntersecting; sync(); }, { threshold: .25 }).observe(s);
    // swipe / drag
    var sx = 0, sy = 0, drag = false;
    s.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; drag = true; sx = e.clientX; sy = e.clientY; });
    addEventListener('pointerup', function (e) {
      if (!drag) return; drag = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
    });
    // subtle foreground/background parallax on desktop
    if (fine && !reduce) s.addEventListener('pointermove', function (e) {
      var r = s.getBoundingClientRect();
      s.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(2));
      s.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(2));
    });
    show(0);
  });

  /* ---------- live local time ---------- */
  $('[data-clock]').forEach(function (el) {
    var f = new Intl.DateTimeFormat('en-GB', { timeZone: el.getAttribute('data-clock'), hour: '2-digit', minute: '2-digit' });
    (function tick() { el.textContent = f.format(new Date()); setTimeout(tick, 15000); })();
  });

  /* ---------- forms: no backend exists, so never claim delivery ---------- */
  $('form[data-validate]').forEach(function (form) {
    var status = $('.form-status', form)[0];
    function check(f) {
      var wrap = f.closest('.field'), ok = true, msg = '';
      if (f.required && !f.value.trim()) { ok = false; msg = 'This field is required.'; }
      else if (f.type === 'email' && f.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)) { ok = false; msg = 'Enter a valid email address.'; }
      else if (f.name === 'whatsapp' && f.value && f.value.replace(/\D/g, '').length < 10) { ok = false; msg = 'Enter a valid phone number.'; }
      wrap.classList.toggle('invalid', !ok);
      $('.err', wrap)[0].textContent = msg;
      f.setAttribute('aria-invalid', !ok);
      return ok;
    }
    $('input,select,textarea', form).forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = Array.prototype.filter.call(form.elements, function (f) { return f.name && !check(f); });
      status.className = 'form-status show';
      if (bad.length) { status.classList.add('error'); status.textContent = 'Please fix the highlighted fields.'; bad[0].focus(); return; }
      var endpoint = form.getAttribute('data-endpoint');
      if (!endpoint) {
        var lines = Array.prototype.map.call(form.elements, function (f) { return f.name && f.value ? f.name + ': ' + f.value : ''; }).filter(Boolean).join('\n');
        location.href = 'mailto:info@zaxboost.com?subject=' + encodeURIComponent(form.getAttribute('data-subject')) + '&body=' + encodeURIComponent(lines);
        status.classList.add('ok');
        status.textContent = 'Your email app should open with your details pre-filled. Nothing has been sent until you press send there. You can also WhatsApp or call 0306 929 0007.';
        return;
      }
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw 0; status.classList.add('ok'); status.textContent = 'Thank you. Your application was received.'; form.reset(); })
        .catch(function () { status.classList.add('error'); status.textContent = 'Submission failed. Please email info@zaxboost.com or call 0306 929 0007.'; });
    });
  });
})();
