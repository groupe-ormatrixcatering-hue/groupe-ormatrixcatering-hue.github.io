(function () {
  'use strict';

  var OM = window.OM;
  var grid = document.getElementById('gallery');
  var bar = document.getElementById('filters');
  if (!OM || !grid || !bar) return;

  var FILTERS = [
    ['all', 'Tout'],
    ['buffet', 'Réceptions & buffets'],
    ['plats', 'Plats'],
    ['lunch', 'Lunch box'],
    ['douceurs', 'Entrées & douceurs'],
    ['videos', 'Vidéos']
  ];
  var VIDEO_EVERY = 3;

  var videoItem = function (v) {
    return {
      type: 'video', cat: 'videos', alt: v[1],
      src: 'assets/video/' + v[0] + '.mp4', poster: 'assets/video/' + v[0] + '.jpg'
    };
  };

  // Photos with a video slipped in every few tiles, remaining videos at the end
  var items = [];
  var videoIndex = 0;
  OM.PHOTOS.forEach(function (p, i) {
    items.push({ type: 'img', cat: p[1], alt: p[2], src: 'assets/img/' + p[0] + '.jpg' });
    if ((i + 1) % VIDEO_EVERY === 0 && videoIndex < OM.VIDEOS.length) {
      items.push(videoItem(OM.VIDEOS[videoIndex++]));
    }
  });
  while (videoIndex < OM.VIDEOS.length) items.push(videoItem(OM.VIDEOS[videoIndex++]));

  var tiles = items.map(function (it, i) {
    var b = document.createElement('button');
    var img = document.createElement('img');
    b.type = 'button';
    b.className = 'g-item' + (it.type === 'video' ? ' is-video' : '');
    b.dataset.cat = it.cat;
    b.dataset.index = String(i);
    b.setAttribute('data-reveal', 'zoom');
    b.setAttribute('aria-label', (it.type === 'video' ? 'Lire la vidéo : ' : 'Agrandir : ') + it.alt);
    img.src = it.poster || it.src;
    img.alt = it.type === 'video' ? '' : it.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    b.appendChild(img);
    if (it.type === 'video') {
      var play = document.createElement('span');
      var cap = document.createElement('span');
      play.className = 'v-play';
      cap.className = 'v-cap';
      cap.textContent = it.alt;
      b.appendChild(play);
      b.appendChild(cap);
    }
    grid.appendChild(b);
    return b;
  });

  var count = function (key) {
    return key === 'all' ? items.length : items.filter(function (it) { return it.cat === key; }).length;
  };

  var buttons = FILTERS.map(function (f) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'filter';
    b.dataset.filter = f[0];
    b.textContent = f[1];
    var sup = document.createElement('sup');
    sup.textContent = String(count(f[0]));
    b.appendChild(sup);
    bar.appendChild(b);
    return b;
  });

  var applyFilter = function (key) {
    var shown = 0;
    buttons.forEach(function (b) {
      var active = b.dataset.filter === key;
      b.classList.toggle('is-active', active);
      if (active) bar.scrollTo({ left: b.offsetLeft - (bar.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
    });
    tiles.forEach(function (t, i) {
      var hide = key !== 'all' && items[i].cat !== key;
      t.classList.toggle('is-hidden', hide);
      t.classList.remove('is-in');
      if (!hide) OM.reveal(t, shown++);
    });
    var title = document.getElementById('gCount');
    if (title) title.textContent = String(shown);
  };

  var fromHash = function () {
    var key = window.location.hash.replace('#', '');
    return FILTERS.some(function (f) { return f[0] === key; }) ? key : 'all';
  };

  bar.addEventListener('click', function (e) {
    var b = e.target.closest('.filter');
    if (!b) return;
    var key = b.dataset.filter;
    window.history.replaceState(null, '', key === 'all' ? window.location.pathname : '#' + key);
    applyFilter(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  grid.addEventListener('click', function (e) {
    var t = e.target.closest('.g-item');
    if (!t) return;
    var visible = tiles.filter(function (el) { return !el.classList.contains('is-hidden'); });
    var list = visible.map(function (el) { return items[+el.dataset.index]; });
    OM.openLightbox(list, visible.indexOf(t));
  });

  window.addEventListener('hashchange', function () { applyFilter(fromHash()); });
  applyFilter(fromHash());
})();
