// 快速选择 · 路线建议：同一份数据渲染「桌面对比表」与「移动端卡片」
// 产品分类：轻装五台山 / 徒步五台山 / 征途五台山；徒步五台山组浅色高亮，路线名与适合人群按各自颜色高亮
;(function () {
  'use strict';

  var ROUTES = [
    {
      name: '轻装五台山',
      cat: '轻装五台山',
      color: '#b8862b',
      group: false,
      attrs: [
        ['徒步难度', '★★★★'],
        ['徒步里程', '约 58 km'],
        ['产品天数', '5 天 · 徒步 3 天'],
        ['徒步路线', '逆时针'],
        ['累计爬升', '约 2450 m'],
        ['累计下降', '约 3400 m'],
        ['匀速耗时', '约 25 h'],
        ['集散城市', '五台山 / 砂河镇'],
        ['住宿安排', '4 晚景区酒店'],
        ['餐食安排', '徒步路餐包、全程早餐、两顿晚餐'],
        ['线路特点', '含景区游玩（小朝台朝圣）'],
        ['领队配比', '1 : 8'],
        ['适合人群', '追求住 / 餐品质，难度较低，适合进阶徒步']
      ]
    },
    {
      name: '逆朝徒步',
      cat: '徒步五台山',
      color: '#2f6fbd',
      group: true,
      attrs: [
        ['徒步难度', '★★★★★'],
        ['徒步里程', '约 58 km'],
        ['产品天数', '3 天 · 徒步 3 天'],
        ['徒步路线', '逆 / 顺朝台'],
        ['累计爬升', '约 2150 m'],
        ['累计下降', '约 3000 m'],
        ['匀速耗时', '约 19 h'],
        ['集散城市', '五台山 / 砂河镇'],
        ['住宿安排', '山下旅店'],
        ['餐食安排', '早餐'],
        ['线路特点', '仅五台山徒步'],
        ['领队配比', '1 : 10'],
        ['适合人群', '追求性价比，难度较低，适合纯徒步']
      ]
    },
    {
      name: '顺朝徒步',
      cat: '徒步五台山',
      color: '#3e8e57',
      group: true,
      attrs: [
        ['徒步难度', '★★★★★'],
        ['徒步里程', '约 58 km'],
        ['产品天数', '3 天 · 徒步 3 天'],
        ['徒步路线', '逆 / 顺朝台'],
        ['累计爬升', '约 3000 m'],
        ['累计下降', '约 2150 m'],
        ['匀速耗时', '约 22 h'],
        ['集散城市', '五台山 / 砂河镇'],
        ['住宿安排', '山下旅店'],
        ['餐食安排', '早餐'],
        ['线路特点', '仅五台山徒步'],
        ['领队配比', '1 : 10'],
        ['适合人群', '追求性价比，难度升级，适合纯徒步']
      ]
    },
    {
      name: '大圆满徒步',
      cat: '徒步五台山',
      color: '#7b5bb5',
      group: true,
      attrs: [
        ['徒步难度', '★★★★★★'],
        ['徒步里程', '约 78 km'],
        ['产品天数', '4 天 · 徒步 3 天'],
        ['徒步路线', '顺时针朝台'],
        ['累计爬升', '约 3600 m'],
        ['累计下降', '约 3600 m'],
        ['匀速耗时', '约 30 h'],
        ['集散城市', '五台山 / 砂河镇'],
        ['住宿安排', '酒店'],
        ['餐食安排', '全程早餐、一顿晚餐'],
        ['线路特点', '含护银沟 / 古南台，五台山大环线'],
        ['领队配比', '1 : 8'],
        ['适合人群', '难度很高，适合徒步狼人']
      ]
    },
    {
      name: '八台连穿',
      cat: '征途五台山',
      color: '#c8423d',
      group: false,
      attrs: [
        ['徒步难度', '★★★★★★'],
        ['徒步里程', '约 100 km'],
        ['产品天数', '6 天 · 徒步 4 天'],
        ['徒步路线', '顺时针朝台'],
        ['累计爬升', '约 4700 m'],
        ['累计下降', '约 4500 m'],
        ['匀速耗时', '约 42 h'],
        ['集散城市', '五台山 / 砂河镇'],
        ['住宿安排', '酒店 / 农家 / 旅店 / 寺庙挂单'],
        ['餐食安排', '部分早餐、一顿晚餐'],
        ['线路特点', '含护银沟徒步 / 古北台徒步，五台山最高难度'],
        ['领队配比', '1 : 5'],
        ['适合人群', '适合老驴']
      ]
    }
  ];

  var section = document.getElementById('routes');
  if (!section) return;

  var table = section.querySelector('.routes-table');
  var cards = section.querySelector('.routes-cards');

  /* ---------- 桌面：对比表（属性为行、路线为列） ---------- */
  function renderTable() {
    // 列分组：徒步五台山组浅色底
    var html = '<colgroup><col class="routes-col-label">';
    ROUTES.forEach(function (r) {
      html += '<col' + (r.group ? ' class="routes-col-group"' : '') + '>';
    });
    html += '</colgroup><thead>';

    // 产品分类行
    html += '<tr class="routes-cat"><th scope="col">产品分类</th>';
    ROUTES.forEach(function (r) {
      html += '<th scope="col">' + r.cat + '</th>';
    });
    html += '</tr>';

    // 路线名行
    html += '<tr class="routes-name"><th scope="row">项目</th>';
    ROUTES.forEach(function (r) {
      html += '<th scope="col" style="color:' + r.color + '">' + r.name + '</th>';
    });
    html += '</tr></thead><tbody>';

    var attrCount = ROUTES[0].attrs.length;
    for (var i = 0; i < attrCount; i++) {
      var label = ROUTES[0].attrs[i][0];
      var isAudience = label === '适合人群';
      html += '<tr' + (isAudience ? ' class="routes-audience"' : '') + '>';
      html += '<th scope="row">' + label + '</th>';
      ROUTES.forEach(function (r) {
        html += '<td' + (isAudience ? ' style="color:' + r.color + '"' : '') + '>' + r.attrs[i][1] + '</td>';
      });
      html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;
  }

  /* ---------- 移动端：每路线一张卡片 ---------- */
  function renderCards() {
    var html = '';
    ROUTES.forEach(function (r, i) {
      html += '<div class="routes-card reveal' + (r.group ? ' routes-card-group' : '') + '" style="--reveal-delay:' + (i * 0.09).toFixed(2) + 's">';
      html += '<h3 class="routes-card-head">';
      html += '<span class="routes-card-cat">' + r.cat + '</span>';
      html += '<span class="routes-card-name" style="color:' + r.color + '">' + r.name + '</span>';
      html += '</h3>';
      html += '<dl class="routes-card-list">';
      r.attrs.forEach(function (a) {
        var isAud = a[0] === '适合人群';
        html += '<div class="routes-card-row">';
        html += '<dt>' + a[0] + '</dt>';
        html += '<dd' + (isAud ? ' style="color:' + r.color + '"' : '') + '>' + a[1] + '</dd>';
        html += '</div>';
      });
      html += '</dl>';
      html += '</div>';
    });
    cards.innerHTML = html;
  }

  /* ---------- 跟团费用卡 → 对应路线高亮跳转 ---------- */
  var nameToIndex = {};
  ROUTES.forEach(function (r, i) { nameToIndex[r.name] = i; });

  function clearRouteHighlight() {
    var els = table.querySelectorAll('.routes-col-highlight, .routes-name-highlight');
    Array.prototype.forEach.call(els, function (el) {
      el.classList.remove('routes-col-highlight', 'routes-name-highlight');
    });
    var cs = cards.querySelectorAll('.routes-card-highlight');
    Array.prototype.forEach.call(cs, function (el) {
      el.classList.remove('routes-card-highlight');
    });
  }

  function highlightRoute(index) {
    clearRouteHighlight();
    var col = table.querySelectorAll('colgroup col')[index + 1];
    if (col) col.classList.add('routes-col-highlight');
    var nameCell = table.querySelectorAll('.routes-name th')[index + 1];
    if (nameCell) nameCell.classList.add('routes-name-highlight');
    var card = cards.querySelectorAll('.routes-card')[index];
    if (card) card.classList.add('routes-card-highlight');
  }

  Array.prototype.forEach.call(document.querySelectorAll('.tour-fee'), function (fee) {
    fee.addEventListener('click', function () {
      var idx = nameToIndex[fee.getAttribute('data-route')];
      if (idx === undefined) return;
      highlightRoute(idx);
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    fee.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fee.click();
      }
    });
  });

  renderTable();
  renderCards();
})();
