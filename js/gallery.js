// 图集区渲染：优先加载 assets/img/ 下的真实图片，缺失时显示渐变占位卡。
// 把真实徒步图片放入 assets/img/ 并按下方 src 命名即可替换占位。
;(function () {
  var items = [
    { src: 'assets/img/placeholder-1.jpg', tag: '东台望海' },
    { src: 'assets/img/placeholder-2.jpg', tag: '北台叶斗' },
    { src: 'assets/img/placeholder-3.jpg', tag: '中台翠岩' },
    { src: 'assets/img/placeholder-4.jpg', tag: '西台挂月' },
    { src: 'assets/img/placeholder-5.jpg', tag: '南台锦绣' },
    { src: 'assets/img/placeholder-6.jpg', tag: '台怀古刹' }
  ];

  var MOUNTAIN_ICON =
    '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3 20h18M6 20V11l4-3v12m8-9v9l4-2.5V8zM2 13l5-4 4 3 4-5 7 6" />' +
    '</svg>';

  var grid = document.getElementById('gallery-grid');
  if (!grid) return;

  items.forEach(function (item, index) {
    var el = document.createElement('div');
    el.className = 'gallery-item reveal';
    el.style.setProperty('--reveal-delay', index * 0.08 + 's');

    var ph = document.createElement('div');
    ph.className = 'gallery-ph';
    ph.innerHTML = MOUNTAIN_ICON + '<span>五台山图片 · 预留</span>';
    el.appendChild(ph);

    var img = new Image();
    img.alt = item.tag;
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.8s ease';
    img.onload = function () {
      ph.style.display = 'none';
      img.style.opacity = '1';
      var tag = document.createElement('span');
      tag.className = 'gallery-tag';
      tag.textContent = item.tag;
      el.appendChild(tag);
    };
    img.src = item.src;
    el.appendChild(img);

    grid.appendChild(el);
  });
})();
