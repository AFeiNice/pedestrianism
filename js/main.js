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
      if (!provinceSel.value) return '请选择出发省份';
      if (!citySel.value) return '请选择出发城市';
      return '';
    }
  };

  var fieldMap = {
    name: $('#name'),
    phone: $('#phone'),
    startDate: startDate,
    endDate: endDate,
    people: peopleInput,
    city: null
  };

  function validateField(key) {
    var fieldEl = key === 'city' ? citySel : fieldMap[key];
    var wrap = fieldEl.closest('.field');
    var errEl = $('#err-' + key);
    var message = validators[key](key === 'city' ? '' : fieldEl.value);
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
    var keys = ['name', 'phone', 'startDate', 'endDate', 'people', 'city'];
    var results = keys.map(validateField);
    var failed = keys.filter(function (k, i) { return !results[i]; });
    if (failed.length) {
      var first = failed[0];
      var target = first === 'city' ? provinceSel : fieldMap[first];
      target.focus();
      if (first === 'city' && provinceSel.value && citySel.disabled === false) citySel.focus();
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
    $$('.field.invalid').forEach(function (el) { el.classList.remove('invalid'); });
  }

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
    params.append('出发城市', provinceSel.value + ' ' + citySel.value);
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
