(function () {
  'use strict';

  var EMAIL = 'ormatrixeurl@gmail.com';
  var STAGGER_MS = 70;
  var STAGGER_MAX = 5;

  var OM = window.OM = window.OM || {};
  var ROOT = window.OM_ROOT || '';
  var I = OM.I18N || {};
  var RTL = document.documentElement.dir === 'rtl';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header, progress bar, hero parallax and gallery shortcut
  var header = $('.site-header');
  var bar = $('.progress');
  var heroMedia = $('#heroMedia');
  var fabGallery = $('#fabGallery');
  var ticking = false;

  var update = function () {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 40);
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (fabGallery) fabGallery.classList.toggle('is-visible', y > window.innerHeight * 0.6);
    if (heroMedia && !reduceMotion && y < window.innerHeight * 1.2) {
      heroMedia.style.transform = 'translate3d(0,' + Math.round(y * 0.18) + 'px,0)';
    }
    ticking = false;
  };
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  update();

  // Mobile menu
  var burger = $('#burger');
  var nav = $('#nav');
  var setMenu = function (open) {
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? I.menuClose : I.menuOpen);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  // Reveal on scroll (staggered by position among siblings)
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  }
  OM.reveal = function (el, index) {
    el.style.setProperty('--d', (index % STAGGER_MAX) * STAGGER_MS + 'ms');
    if (io) io.observe(el); else el.classList.add('is-in');
  };
  $$('[data-reveal]').forEach(function (el) {
    var siblings = $$('[data-reveal]', el.parentNode).filter(function (s) { return s.parentNode === el.parentNode; });
    OM.reveal(el, siblings.indexOf(el));
  });

  // Lightbox (photos and videos)
  var lb = $('#lightbox');
  var stage = $('#lbStage');
  var current = { items: [], index: 0 };
  var lastFocus = null;
  var SWIPE_PX = 50;

  var render = function () {
    var it = current.items[current.index];
    var node;
    stage.textContent = '';
    if (it.type === 'video') {
      node = document.createElement('video');
      node.src = it.src;
      node.poster = it.poster || '';
      node.controls = true;
      node.autoplay = true;
      node.playsInline = true;
    } else {
      node = document.createElement('img');
      node.src = it.src;
      node.alt = it.alt || '';
    }
    stage.appendChild(node);
  };
  var step = function (d) {
    var n = current.items.length;
    current.index = (current.index + d + n) % n;
    render();
  };
  var closeLightbox = function () {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    stage.textContent = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  OM.openLightbox = function (items, index) {
    current = { items: items, index: index };
    lastFocus = document.activeElement;
    render();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('.lb-close', lb).focus();
  };
  $('.lb-close', lb).addEventListener('click', closeLightbox);
  $('.lb-prev', lb).addEventListener('click', function () { step(-1); });
  $('.lb-next', lb).addEventListener('click', function () { step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(RTL ? 1 : -1);
    if (e.key === 'ArrowRight') step(RTL ? -1 : 1);
  });
  var touchX = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > SWIPE_PX) step((dx < 0 ? 1 : -1) * (RTL ? -1 : 1));
  }, { passive: true });

  // Home page: open the lightbox from a group of zoomable photos / video tiles
  var toItem = function (el) {
    if (el.dataset.video) {
      return {
        type: 'video',
        src: ROOT + 'assets/video/' + el.dataset.video + '.mp4',
        poster: ROOT + 'assets/video/' + el.dataset.video + '.jpg',
        alt: el.getAttribute('aria-label') || ''
      };
    }
    var img = $('img', el);
    return { type: 'img', src: el.dataset.zoom, alt: img ? img.alt : '' };
  };
  $$('[data-zoom-group]').forEach(function (group) {
    var els = $$('[data-zoom], [data-video]', group);
    var items = els.map(toItem);
    els.forEach(function (el, i) {
      el.addEventListener('click', function () { OM.openLightbox(items, i); });
    });
  });

  // Media counter
  var total = (OM.PHOTOS ? OM.PHOTOS.length : 0) + (OM.VIDEOS ? OM.VIDEOS.length : 0);
  if (total) $$('[data-media-count]').forEach(function (el) { el.textContent = String(total); });

  // Contact form -> pre-filled WhatsApp message (or e-mail)
  var form = $('#contactForm');
  if (form) {
    var note = $('#formNote');
    var buildRequest = function () {
      var ok = true;
      ['prenom', 'nom', 'tel'].forEach(function (n) {
        var f = form.elements[n];
        var bad = !f.value.trim();
        f.classList.toggle('is-invalid', bad);
        if (bad) ok = false;
      });
      if (!ok) { note.textContent = I.formError; return null; }
      var d = form.elements;
      return {
        subject: I.subject + d.service.value,
        body: [
          I.lName + d.prenom.value.trim() + ' ' + d.nom.value.trim(),
          I.lPhone + d.tel.value.trim(),
          I.lEmail + (d.email.value.trim() || I.notGiven),
          I.lService + d.service.value,
          I.lDate + (d.date.value || I.toSpecify),
          (d.invites.dataset.label || I.lQty) + I.colon + (d.invites.value.trim() || I.toSpecify),
          '',
          d.message.value.trim()
        ].join('\n')
      };
    };
    var waNumber = '';
    $$('[data-wa]', form).forEach(function (btn) {
      btn.addEventListener('click', function () { waNumber = btn.getAttribute('data-wa'); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var req = buildRequest();
      if (!req || !waNumber) return;
      var text = I.greeting + '\n' + req.subject + '\n\n' + req.body;
      window.open('https://wa.me/' + waNumber + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      note.textContent = I.waOpened;
    });
    var mailBtn = $('[data-mail]', form);
    if (mailBtn) mailBtn.addEventListener('click', function () {
      var req = buildRequest();
      if (!req) return;
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(req.subject) + '&body=' + encodeURIComponent(req.body);
      note.textContent = I.mailOpened;
    });
  }

  var y = $('#year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
