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

  /* ---------- hero sparks (single canvas, paused off-screen) ---------- */
  var cv = d.getElementById('sparks');
  if (cv && !reduce && !small()) {
    var ctx = cv.getContext('2d'), P = [], W, H, run = true;
    var size = function () { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
    size(); addEventListener('resize', size);
    for (var i = 0; i < 40; i++) P.push({ x: Math.random(), y: Math.random(), r: Math.random() * 2.2 + .6, v: Math.random() * .0004 + .00012, a: Math.random() * .6 + .2, s: Math.random() * 6 });
    var loop = function () {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      P.forEach(function (p) {
        p.y -= p.v * 16; p.s += .02; if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
        ctx.beginPath(); ctx.fillStyle = 'rgba(255,190,34,' + (p.a * (.6 + .4 * Math.sin(p.s))) + ')';
        ctx.arc(p.x * W + Math.sin(p.s) * 8, p.y * H, p.r, 0, 6.283); ctx.fill();
      });
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(function (e) { var was = run; run = e[0].isIntersecting; if (run && !was) loop(); }).observe(cv);
    loop();
  }

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
  var heroVid = $('video[data-hero]')[0];
  if (heroVid) {
    if (motionOK) {
      heroVid.addEventListener('playing', function () { hero.classList.add('is-playing'); });
      heroVid.addEventListener('timeupdate', function () { // skip the dark bokeh intro on loop
        if (heroVid.duration && heroVid.currentTime > heroVid.duration - .25) heroVid.currentTime = 2.4;
      });
      heroVid.addEventListener('loadedmetadata', function () { if (heroVid.currentTime < 2) heroVid.currentTime = 2.4; });
      tryPlay(heroVid);
    } else { heroVid.removeAttribute('autoplay'); heroVid.pause(); }
  }
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
      d.body.classList.toggle('cursor-hover', !!e.target.closest('a,button,select,summary,.rail-item,[data-tilt]'));
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

  /* ---------- campaign rail: arrows + mouse drag ---------- */
  $('.rail').forEach(function (rail) {
    var wrap = rail.closest('section') || rail.parentNode, step = function () { return Math.max(260, rail.clientWidth * .6); };
    var prev = $('[data-rail="prev"]', wrap)[0], next = $('[data-rail="next"]', wrap)[0];
    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', function (e) {
      if (!down) return; var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; rail.classList.add('drag'); }
      rail.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', function () { down = false; rail.classList.remove('drag'); });
    rail.addEventListener('dragstart', function (e) { e.preventDefault(); });
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
