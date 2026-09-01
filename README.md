# 五台山徒步 · 报名网站

面向五台山徒步报名的小型网站：徒步者填写**姓名、手机号、预计出发日期～截止日期、人数、往返城市（全国内地省→市两级联动）、是否需要住宿及住宿选择**，提交后自动将内容发送到报名邮箱 `13233508884@163.com`。

- 移动端 / PC 端自适应，苹果官网风格，滚动丝滑。
- 徒步图片预留位置：把真实图片放入 [assets/img/](assets/img/) 并命名为 `placeholder-1.jpg` ～ `placeholder-6.jpg` 即可自动替换占位卡片。
- 城市数据来自开源数据集 [modood/Administrative-divisions-of-China](https://github.com/modood/Administrative-divisions-of-China)（MIT）。
- 邮件服务使用开源库 [Express](https://expressjs.com)（MIT）+ [Nodemailer](https://nodemailer.com)（MIT）。

## 目录结构

```
├── index.html          # 单页网站
├── css/style.css       # 样式（移动端优先）
├── js/
│   ├── config.js       # 邮件服务地址配置
│   ├── cities.js       # 全国省→市数据
│   ├── gallery.js      # 图集占位渲染
│   └── main.js         # 城市联动 / 校验 / 提交
├── assets/img/         # 徒步图片预留目录
├── tools/
│   └── make_driver_posters.py  # 司机推广二维码海报生成脚本
└── server/             # 独立邮件服务（Node.js，历史方案）
    ├── server.js
    ├── package.json
    └── .env.example
```

## 快速开始（本地联调）

### 方式一：纯静态预览（推荐，日常改页面用这个）

当前线上报名表单走第三方 FormSubmit，本地预览只需托管静态文件，无需任何后端：

```bash
cd /Users/afei/Desktop/pedestrianism
python3 -m http.server 3000   # 然后浏览器打开 http://localhost:3000
```

### 方式二：自建邮件服务（历史方案，仅调试自建收发信时用）

> 线上表单不走这个服务，只在本地联调自建邮件时才需要。

1. 配置 163 邮箱授权码：

   > 登录网页版 163 邮箱 → 设置 → 客户端授权密码 → 开启后生成一串「授权码」（不是登录密码）。

   然后：
   ```bash
   cd server
   cp .env.example .env
   # 编辑 .env：填入 SMTP_USER（163 邮箱）、SMTP_PASS（上一步的授权码），MAIL_TO 默认为 13233508884@163.com
   npm install
   node server.js
   ```

2. 浏览器打开 `http://localhost:3000`。服务会同时托管网站和邮件接口（同源 `/api/send`，无需改配置）。

3. 填写并提交报名表单 → 检查 `13233508884@163.com` 是否收到邮件。

## 司机推广二维码海报

给出租车司机生成专属二维码海报，用于线下推广。每张海报的二维码指向：

```text
https://AFeiNice.github.io/pedestrianism/?src=司机名&phone=手机号
```

徒步者扫码报名后，报名邮件会自动带上 **「推荐人 = 司机名」「推荐人电话 = 手机号」**，方便按司机结算推广费。

### 前提

- 已安装 Python3，并安装依赖：`pip3 install qrcode pillow`
- 桌面存在海报模板底图 `~/Desktop/1-报名二维码-v2.png`

### 使用

```bash
cd tools
python3 make_driver_posters.py "张师傅" "李师傅,13800000000" "王师傅"
```

- 带手机号用 **「姓名,手机号」** 格式；不带手机号只写姓名（邮件里就没有「推荐人电话」）。
- 海报输出到 `~/Desktop/driver-posters/`，文件名为「司机名-海报.png」（生成文件放桌面，不占用项目目录）。
- 扫码报名时，推荐人会由二维码自动带入表单并锁定不可改；没扫码的徒步者可手动填写「推荐人」栏兜底。

## 部署

前端是纯静态页面，可部署到任意静态托管（GitHub Pages、Netlify、Vercel、腾讯云 COS、阿里云 OSS 等），把**根目录文件**上传即可。

邮件服务需要单独跑在一个能运行 Node.js 的环境：

- 小 VPS：`cd server && npm install`，填好 `.env` 后用进程管理工具（pm2 / systemd）常驻运行。
- Render / Railway 等免费平台：部署 `server/` 目录，配置环境变量 `SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / MAIL_TO`。

部署后把 [js/config.js](js/config.js) 里的 `API_URL` 改成邮件服务的完整地址，例如：

```js
window.APP_CONFIG.API_URL = 'https://your-mailer.example.com/api/send';
```

跨域已默认放开（`Access-Control-Allow-Origin: *`）；如需收紧，可在服务端 `.env` 中设置 `ALLOWED_ORIGINS`。

## 表单字段

| 字段 | 校验 |
| --- | --- |
| 姓名 | 必填，1~30 字 |
| 手机号 | 必填，`^1[3-9]\d{9}$` |
| 预计出发日期 | 必填，不得早于今天 |
| 截止日期 | 必填，不得早于出发日期 |
| 人数 | 必填，1~99，支持步进按钮 |
| 往返城市 | 必填，省→市两级联动 |
| 是否需要住宿 | 必填，是 / 否 |
| 住宿选择 | 选「是」时必填：合租 / 整间大床 / 双床 |
| 住宿数量 | 选「是」时必填：合租选床铺个数，整间大床/双床选房间间数（1~99） |
| 是否需要租赁穿戴设备 | 必填，是 / 否 |
| 租赁设备 | 选「是」时必填，多选：登山杖/冲锋衣/羽绒服/登山鞋/睡袋/头灯/护膝/雨衣/防寒手套/登山背包 |

## 数据来源

城市数据生成自 `modood/Administrative-divisions-of-China` 的 `dist/pca.json`（MIT），实现时按最新版本解析出省→地级市两级；直辖市直接归并为本市。如需更新，重新抓取该文件并运行同样的转换即可。
