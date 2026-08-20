// 图集轮播：首个滑片为视频封面，其余为图片。
// 懒加载策略：仅当前张 + 下一张加载媒体，非活跃视频暂停并卸载，节省首屏与流量。
;(function () {
  'use strict';

  var SLIDES = [
    { type: 'video', src: 'assets/img/placeholder.mp4', tag: '五台山 · 云海日出' },
    { type: 'img', src: 'assets/img/placeholder-1.jpg', tag: '东台望海' },
    { type: 'img', src: 'assets/img/placeholder-2.jpg', tag: '北台叶斗' },
    { type: 'img', src: 'assets/img/placeholder-3.jpg', tag: '中台翠岩' },
    { type: 'img', src: 'assets/img/placeholder-4.jpg', tag: '西台挂月' },
    { type: 'img', src: 'assets/img/placeholder-5.jpg', tag: '南台锦绣' },
    { type: 'img', src: 'assets/img/placeholder-6.jpg', tag: '台怀古刹' },
    { type: 'img', src: 'assets/img/placeholder-7.jpg', tag: '高山草甸' },
    { type: 'img', src: 'assets/img/placeholder-8.jpg', tag: '云海翻涌' },
    { type: 'img', src: 'assets/img/placeholder-9.jpg', tag: '山间晨雾' },
    { type: 'img', src: 'assets/img/placeholder-10.jpg', tag: '朝台之路' },
    { type: 'img', src: 'assets/img/placeholder-11.jpg', tag: '晨钟暮鼓' }
  ];

  var carousel = document.getElementById('gallery-carousel');
  if (!carousel) return;

  /* ---------- 构建 DOM ---------- */
  carousel.innerHTML = '';

  var viewport = document.createElement('div');
  viewport.className = 'carousel-viewport';

  var track = document.createElement('div');
  track.className = 'carousel-track';

  var mediaEls = SLIDES.map(function (item) {
    var slide = document.createElement('div');
    slide.className = 'carousel-slide';

    var media;
    if (item.type === 'video') {
      media = document.createElement('video');
      media.className = 'carousel-media';
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = 'none';
      media.fetchPriority = 'high';
    } else {
      media = document.createElement('img');
      media.className = 'carousel-media';
      media.alt = item.tag;
      media.loading = 'lazy';
      media.decoding = 'async';
    }
    media.dataset.src = item.src;

    var tag = document.createElement('span');
    tag.className = 'gallery-tag';
    tag.textContent = item.tag;

    slide.appendChild(media);
    slide.appendChild(tag);
    track.appendChild(slide);
    return media;
  });

  viewport.appendChild(track);
  carousel.appendChild(viewport);

  function makeArrow(dir, label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'carousel-arrow carousel-arrow-' + dir;
    b.setAttribute('aria-label', label);
    b.innerHTML = dir === 'prev'
      ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>'
      : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
    return b;
  }
  var prevBtn = makeArrow('prev', '上一张');
  var nextBtn = makeArrow('next', '下一张');
  carousel.appendChild(prevBtn);
  carousel.appendChild(nextBtn);

  var dotsWrap = document.createElement('div');
  dotsWrap.className = 'carousel-dots';
  var dots = SLIDES.map(function (_, i) {
    var d = document.createElement('button');
    d.type = 'button';
    d.className = 'carousel-dot';
    d.setAttribute('aria-label', '第 ' + (i + 1) + ' 张');
    d.addEventListener('click', function () { go(i); });
    dotsWrap.appendChild(d);
    return d;
  });
  carousel.appendChild(dotsWrap);

  /* ---------- 状态与切换 ---------- */
  var index = 0;
  var total = SLIDES.length;
  var timer = null;
  var AUTOPLAY_MS = 4200;

  function update() {
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    prevBtn.classList.toggle('is-disabled', index === 0);
    nextBtn.classList.toggle('is-disabled', index === total - 1);
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });
    ensureLoaded();
    manageVideo();
    restartAutoplay();
  }

  function go(i) {
    index = Math.max(0, Math.min(total - 1, i));
    update();
  }
  function next() { go(index + 1); }
  function prev() { go(index - 1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  /* ---------- 懒加载：只拉当前张与下一张 ---------- */
  function ensureLoaded() {
    var want = {};
    want[index] = 1;
    if (index + 1 < total) want[index + 1] = 1;

    SLIDES.forEach(function (item, i) {
      var m = mediaEls[i];
      if (want[i]) {
        if (!m.getAttribute('src') && m.dataset.src) {
          m.setAttribute('src', m.dataset.src);
          if (item.type === 'video') m.load();
        }
      } else if (item.type === 'video') {
        m.pause();
        m.removeAttribute('src');
        m.load();
      }
    });
  }

  /* ---------- 视频播放管理 ---------- */
  function manageVideo() {
    var m = mediaEls[0];
    if (SLIDES[index].type === 'video') {
      var p = m.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      m.pause();
    }
  }

  /* ---------- 自动播放：视频封面停留时不自动切换 ---------- */
  function restartAutoplay() {
    stopAutoplay();
    if (SLIDES[index].type === 'video') return;
    timer = setTimeout(function () {
      index < total - 1 ? next() : go(0);
    }, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', restartAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', restartAutoplay);

  /* ---------- 触摸 / 鼠标滑动 ---------- */
  var dragging = false;
  var startX = 0;
  var dragX = 0;

  viewport.addEventListener('pointerdown', function (e) {
    dragging = true;
    startX = e.clientX;
    dragX = 0;
    track.style.transition = 'none';
    viewport.classList.add('is-dragging');
    stopAutoplay();
    try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
  });

  viewport.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    dragX = e.clientX - startX;
    var base = -index * viewport.clientWidth;
    var dx = base + dragX;
    var max = -(total - 1) * viewport.clientWidth;
    if (dx > 0) dx *= 0.35;
    if (dx < max) dx = max + (dx - max) * 0.35;
    track.style.transform = 'translateX(' + dx + 'px)';
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    viewport.classList.remove('is-dragging');
    var thresh = viewport.clientWidth * 0.18;
    if (dragX < -thresh) next();
    else if (dragX > thresh) prev();
    else update();
  }

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('pointerleave', function (e) {
    if (dragging && e.buttons === 0) endDrag();
  });

  /* ---------- 键盘 ---------- */
  document.addEventListener('keydown', function (e) {
    if (!carousel.contains(document.activeElement)) return;
    if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
  });

  update();
})();
