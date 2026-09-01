// 主逻辑：导航、滚动动画、城市联动、表单校验与提交
;(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------- 导航栏滚动效果 ---------------- */
  var nav = $('#nav');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- 滚动显现动画 ---------------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------------- 城市两级联动 ---------------- */
  var provinceSel = $('#province');
  var citySel = $('#city');

  Object.keys(window.CITIES).forEach(function (province) {
    var opt = document.createElement('option');
    opt.value = province;
    opt.textContent = province;
    provinceSel.appendChild(opt);
  });

  function populateCities(province) {
    citySel.innerHTML = '';
    var list = (window.CITIES[province] || []).slice();
    if (!list.length) {
      citySel.appendChild(new Option('暂无城市', ''));
      citySel.disabled = true;
      return;
    }
    list.unshift('请选择城市');
    list.forEach(function (name, i) {
      var opt = new Option(name, name);
      if (i === 0) opt.value = '';
      citySel.appendChild(opt);
    });
    citySel.disabled = false;
  }

  provinceSel.addEventListener('change', function () {
    var province = provinceSel.value;
    populateCities(province);
    if (province === '') {
      citySel.innerHTML = '';
      citySel.appendChild(new Option('请先选择省份', ''));
      citySel.disabled = true;
    }
    validateField('city');
  });

  /* ---------------- 住宿选择联动 ---------------- */
  var accomTypeField = $('#accomType-field');
  var accomQtyField = $('#accomQty-field');
  var accomQtyLabel = $('#accomQty-label');
  var accomQtyInput = $('#accom-qty');

  var ACCOM_QTY_LABEL = {
    '合租': '床铺数量（个）',
    '整间大床': '房间数量（间）',
    '双床': '房间数量（间）'
  };

  function selectedAccomType() {
    var t = $('input[name="accomType"]:checked');
    return t ? t.value : '';
  }

  function toggleAccomType() {
    var need = $('input[name="needAccom"]:checked');
    var show = need && need.value === '是';
    accomTypeField.classList.toggle('is-hidden', !show);
    if (!show) {
      $$('input[name="accomType"]').forEach(function (r) { r.checked = false; });
    }
    toggleAccomQty();
  }

  function toggleAccomQty() {
    var need = $('input[name="needAccom"]:checked');
    var type = selectedAccomType();
    var show = need && need.value === '是' && !!type;
    accomQtyField.classList.toggle('is-hidden', !show);
    if (show) {
      accomQtyLabel.innerHTML = ACCOM_QTY_LABEL[type] + ' <em>*</em>';
    } else {
      accomQtyInput.value = '1';
    }
  }

  $$('input[name="needAccom"]').forEach(function (r) {
    r.addEventListener('change', function () {
      toggleAccomType();
      validateField('needAccom');
      validateField('accomType');
      validateField('accomQty');
    });
  });
  $$('input[name="accomType"]').forEach(function (r) {
    r.addEventListener('change', function () {
      toggleAccomQty();
      validateField('accomType');
      validateField('accomQty');
    });
  });

  function clampQty(v) {
    v = parseInt(v, 10);
    if (isNaN(v)) v = 1;
    return Math.min(99, Math.max(1, v));
  }
  $('#accom-qty-minus').addEventListener('click', function () {
    accomQtyInput.value = clampQty((parseInt(accomQtyInput.value, 10) || 1) - 1);
    validateField('accomQty');
  });
  $('#accom-qty-plus').addEventListener('click', function () {
    accomQtyInput.value = clampQty((parseInt(accomQtyInput.value, 10) || 1) + 1);
    validateField('accomQty');
  });
  accomQtyInput.addEventListener('change', function () {
    accomQtyInput.value = clampQty(accomQtyInput.value);
    validateField('accomQty');
  });

  var gearField = $('#gear-field');
  var gearItems = $$('input[name="gear"]');

  function toggleGear() {
    var need = $('input[name="needGear"]:checked');
    var show = need && need.value === '是';
    gearField.classList.toggle('is-hidden', !show);
    if (!show) {
      gearItems.forEach(function (g) { g.checked = false; });
    }
  }

  $$('input[name="needGear"]').forEach(function (r) {
    r.addEventListener('change', function () {
      toggleGear();
      validateField('needGear');
      validateField('gear');
    });
  });
  gearItems.forEach(function (g) {
    g.addEventListener('change', function () { validateField('gear'); });
  });

  /* ---------------- 日期约束 ---------------- */
  var startDate = $('#start-date');
  var endDate = $('#end-date');

  function todayStr() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  startDate.min = todayStr();
  startDate.addEventListener('change', function () {
    endDate.min = startDate.value || '';
    if (endDate.value && startDate.value && endDate.value < startDate.value) {
      endDate.value = '';
    }
    validateField('startDate');
    validateField('endDate');
  });
  endDate.addEventListener('change', function () {
    validateField('endDate');
  });

  /* ---------------- 人数步进器 ---------------- */
  var peopleInput = $('#people');

  function clampPeople(v) {
    v = parseInt(v, 10);
    if (isNaN(v)) v = 1;
    return Math.min(99, Math.max(1, v));
  }

  $('#people-minus').addEventListener('click', function () {
    peopleInput.value = clampPeople((parseInt(peopleInput.value, 10) || 1) - 1);
    validateField('people');
  });
  $('#people-plus').addEventListener('click', function () {
    peopleInput.value = clampPeople((parseInt(peopleInput.value, 10) || 1) + 1);
    validateField('people');
  });
  peopleInput.addEventListener('change', function () {
    peopleInput.value = clampPeople(peopleInput.value);
    validateField('people');
  });

  /* ---------------- 校验规则 ---------------- */
  var validators = {
    name: function (val) {
      val = val.trim();
      if (!val) return '请填写姓名';
      if (val.length > 30) return '姓名不能超过 30 个字';
      return '';
    },
    phone: function (val) {
      val = val.trim();
      if (!val) return '请填写手机号';
      if (!/^1[3-9]\d{9}$/.test(val)) return '请输入正确的 11 位手机号';
      return '';
    },
    startDate: function (val) {
      if (!val) return '请选择出发日期';
      if (val < startDate.min) return '出发日期不能早于今天';
      return '';
    },
    endDate: function (val) {
      if (!val) return '请选择截止日期';
      if (startDate.value && val < startDate.value) return '截止日期不能早于出发日期';
      return '';
    },
    people: function (val) {
      var n = parseInt(val, 10);
      if (isNaN(n) || !/^\d+$/.test(val.trim())) return '请填写人数';
      if (n < 1 || n > 99) return '人数需在 1 ~ 99 之间';
      return '';
    },
    city: function () {
      if (!provinceSel.value) return '请选择往返省份';
      if (!citySel.value) return '请选择往返城市';
      return '';
    },
    needAccom: function () {
      return $('input[name="needAccom"]:checked') ? '' : '请选择是否需要住宿';
    },
    accomType: function () {
      var need = $('input[name="needAccom"]:checked');
      if (!need || need.value === '否') return '';
      return $('input[name="accomType"]:checked') ? '' : '请选择住宿类型';
    },
    accomQty: function () {
      var need = $('input[name="needAccom"]:checked');
      if (!need || need.value !== '是' || !selectedAccomType()) return '';
      var n = parseInt(accomQtyInput.value, 10);
      if (isNaN(n) || !/^\d+$/.test(accomQtyInput.value.trim())) return '请填写数量';
      if (n < 1 || n > 99) return '数量需在 1 ~ 99 之间';
      return '';
    },
    needGear: function () {
      return $('input[name="needGear"]:checked') ? '' : '请选择是否需要租赁穿戴设备';
    },
    gear: function () {
      var need = $('input[name="needGear"]:checked');
      if (!need || need.value !== '是') return '';
      return $('input[name="gear"]:checked') ? '' : '请至少选择一件设备';
    }
  };

  var fieldMap = {
    name: $('#name'),
    phone: $('#phone'),
    startDate: startDate,
    endDate: endDate,
    people: peopleInput,
    city: null,
    needAccom: null,
    accomType: null,
    accomQty: accomQtyInput,
    needGear: null,
    gear: null
  };

  function validateField(key) {
    var fieldEl;
    if (key === 'city') {
      fieldEl = citySel;
    } else if (key === 'needAccom' || key === 'accomType' || key === 'needGear' || key === 'gear') {
      fieldEl = $('#' + key + '-field');
    } else {
      fieldEl = fieldMap[key];
    }
    var wrap = fieldEl.closest('.field');
    var errEl = $('#err-' + key);
    var noValue = key === 'city' || key === 'needAccom' || key === 'accomType' || key === 'needGear' || key === 'gear';
    var message = validators[key](noValue ? '' : fieldEl.value);
    var invalid = message !== '';
    wrap.classList.toggle('invalid', invalid);
    errEl.textContent = message;
    return !invalid;
  }

  // 输入即校验（实时反馈）
  Object.keys(validators).forEach(function (key) {
    var fieldEl = key === 'city' ? null : fieldMap[key];
    if (!fieldEl) return;
    ['input', 'change', 'blur'].forEach(function (evt) {
      fieldEl.addEventListener(evt, function () { validateField(key); });
    });
  });
  [provinceSel, citySel].forEach(function (sel) {
    sel.addEventListener('change', function () { validateField('city'); });
  });

  function validateAll() {
    var keys = ['name', 'phone', 'startDate', 'endDate', 'people', 'city', 'needAccom', 'accomType', 'accomQty', 'needGear', 'gear'];
    var results = keys.map(validateField);
    var failed = keys.filter(function (k, i) { return !results[i]; });
    if (failed.length) {
      var first = failed[0];
      if (first === 'city') {
        provinceSel.focus();
        if (provinceSel.value && citySel.disabled === false) citySel.focus();
      } else if (first === 'needAccom' || first === 'accomType' || first === 'needGear' || first === 'gear') {
        var radio = $('input[name="' + first + '"]');
        if (radio) radio.focus();
      } else {
        fieldMap[first].focus();
      }
    }
    return failed.length === 0;
  }

  /* ---------------- 提交 ---------------- */
  var form = $('#signup-form');
  var submitBtn = $('#submit-btn');
  var feedback = $('#form-feedback');

  function setLoading(loading) {
    submitBtn.classList.toggle('is-loading', loading);
    submitBtn.classList.toggle('is-disabled', loading);
    submitBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
  }

  function showFeedback(type, text) {
    feedback.textContent = text;
    feedback.classList.remove('success', 'error');
    feedback.classList.add('show', type);
  }

  function resetForm() {
    form.reset();
    peopleInput.value = '1';
    startDate.min = todayStr();
    endDate.min = '';
    provinceSel.value = '';
    populateCities('');
    citySel.innerHTML = '';
    citySel.appendChild(new Option('请先选择省份', ''));
    citySel.disabled = true;
    $$('input[name="needAccom"], input[name="accomType"], input[name="needGear"]').forEach(function (r) { r.checked = false; });
    accomQtyInput.value = '1';
    toggleAccomType();
    toggleGear();
    $$('.field.invalid').forEach(function (el) { el.classList.remove('invalid'); });
  }

  /* ---------------- 扫码渠道：出租车司机专属二维码 ?src=司机名 ---------------- */
  var CHANNEL_KEY = 'wutai_channel';
  var channelSrc = '';
  (function () {
    var m = window.location.search.match(/[?&]src=([^&]+)/);
    if (m) {
      try {
        channelSrc = decodeURIComponent(m[1]).trim();
        localStorage.setItem(CHANNEL_KEY, channelSrc);
      } catch (e) { channelSrc = ''; }
    }
    if (!channelSrc) {
      try { channelSrc = localStorage.getItem(CHANNEL_KEY) || ''; } catch (e) { channelSrc = ''; }
    }
  })();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    feedback.classList.remove('show');

    if (!validateAll()) return;

    var nameVal = $('#name').value.trim();
    var params = new URLSearchParams();
    params.append('姓名', nameVal);
    params.append('手机号', $('#phone').value.trim());
    params.append('预计出发日期', startDate.value);
    params.append('截止日期', endDate.value);
    params.append('人数', peopleInput.value);
    params.append('往返城市', provinceSel.value + ' ' + citySel.value);
    var needAccomEl = $('input[name="needAccom"]:checked');
    params.append('是否需要住宿', needAccomEl ? needAccomEl.value : '');
    if (needAccomEl && needAccomEl.value === '是') {
      var accomTypeEl = $('input[name="accomType"]:checked');
      var type = accomTypeEl ? accomTypeEl.value : '';
      params.append('住宿选择', type);
      var qty = parseInt(accomQtyInput.value, 10) || 1;
      if (type === '合租') {
        params.append('床铺数量', qty + ' 个');
      } else if (type === '整间大床' || type === '双床') {
        params.append('房间数量', qty + ' 间（' + type + '）');
      }
    }
    var needGearEl = $('input[name="needGear"]:checked');
    params.append('是否需要租赁穿戴设备', needGearEl ? needGearEl.value : '');
    if (needGearEl && needGearEl.value === '是') {
      var gearChecked = $$('input[name="gear"]:checked').map(function (g) { return g.value; });
      if (gearChecked.length) params.append('租赁设备', gearChecked.join('、'));
    }
    if (channelSrc) params.append('来源渠道', channelSrc);
    var referrer = $('#referrer').value.trim();
    if (referrer) params.append('推荐人', referrer);
    params.append('_subject', '五台山徒步新报名 · ' + nameVal + ' · ' + startDate.value + ' ~ ' + endDate.value);

    setLoading(true);

    fetch(window.APP_CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: params
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        var succeeded = result.ok && result.data && String(result.data.success) === 'true';
        if (succeeded) {
          showFeedback('success', '提交成功！报名信息已发送至邮箱，我们会尽快与您联系。');
          resetForm();
        } else {
          showFeedback('error', result.data && result.data.message ? result.data.message : '提交失败，请稍后重试。');
        }
      })
      .catch(function () {
        showFeedback('error', '网络异常，提交失败，请稍后重试。');
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
