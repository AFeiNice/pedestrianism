// 五台山徒步报名 —— 邮件服务
// 独立的小型 Node 服务：接收前端报名 JSON，通过 163 SMTP 发送邮件。
// 本地联调：node server/server.js 会同时托管根目录静态站点（localhost:3000）。
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50kb' }));

/* ---------- CORS ---------- */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

/* ---------- 校验 ---------- */
function validate(payload) {
  const errs = [];
  const name = (payload.name || '').trim();
  const phone = (payload.phone || '').trim();
  const startDate = (payload.startDate || '').trim();
  const endDate = (payload.endDate || '').trim();
  const people = payload.people;
  const province = (payload.province || '').trim();
  const city = (payload.city || '').trim();

  if (!name || name.length > 30) errs.push('姓名无效');
  if (!/^1[3-9]\d{9}$/.test(phone)) errs.push('手机号无效');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) errs.push('出发日期无效');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) errs.push('截止日期无效');
  if (startDate && endDate && endDate < startDate) errs.push('截止日期早于出发日期');
  const n = parseInt(people, 10);
  if (!/^\d+$/.test(String(people).trim()) || n < 1 || n > 99) errs.push('人数无效');
  if (!province || !city) errs.push('出发城市不完整');

  return { errs, data: { name, phone, startDate, endDate, people: n, province, city } };
}

/* ---------- 邮件 ---------- */
function buildMail(data) {
  const rows = [
    ['姓名', data.name],
    ['手机号', data.phone],
    ['预计出发日期', data.startDate],
    ['截止日期', data.endDate],
    ['人数', String(data.people)],
    ['出发城市', data.province + ' ' + data.city]
  ];

  const text = rows.map(([k, v]) => `${k}：${v}`).join('\n');
  const html =
    '<div style="font-family:-apple-system,PingFang SC,Microsoft YaHei,sans-serif;max-width:560px;margin:0 auto;' +
    'border:1px solid #eee;border-radius:12px;overflow:hidden">' +
    '<div style="background:#1d1d1f;color:#e9bd5f;padding:18px 24px;font-size:18px;font-weight:600">' +
    '五台山徒步 · 新报名</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:15px">' +
    rows
      .map(
        ([k, v], i) =>
          '<tr style="background:' +
          (i % 2 ? '#f7f7f9' : '#ffffff') +
          '"><td style="padding:12px 20px;color:#6e6e73;width:120px">' +
          k +
          '</td><td style="padding:12px 20px;font-weight:600">' +
          String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;') +
          '</td></tr>'
      )
      .join('') +
    '</table></div>';

  return { text, html };
}

app.post('/api/send', async (req, res) => {
  const { errs, data } = validate(req.body || {});
  if (errs.length) {
    return res.status(400).json({ ok: false, message: '提交内容校验失败：' + errs.join('、') });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ ok: false, message: '服务端尚未配置 SMTP 授权信息，请联系管理员。' });
  }

  const { text, html } = buildMail(data);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.163.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: `"五台山徒步报名" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      subject: `五台山徒步新报名 · ${data.name} · ${data.startDate} ~ ${data.endDate}`,
      text,
      html
    });
    res.json({ ok: true, message: '已发送' });
  } catch (err) {
    console.error('邮件发送失败:', err.message);
    res.status(502).json({ ok: false, message: '邮件发送失败，请稍后重试或联系管理员。' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

/* ---------- 本地联调：顺带托管前端静态站点 ---------- */
const staticRoot = path.join(__dirname, '..');
app.use(express.static(staticRoot));

app.listen(PORT, () => {
  console.log(`五台山徒步邮件服务已启动：http://localhost:${PORT}`);
  console.log(`  - 站点：   http://localhost:${PORT}/`);
  console.log(`  - 健康检查：http://localhost:${PORT}/health`);
  console.log('  - 若未配置 SMTP，请复制 server/.env.example 为 server/.env 并填写。');
});
