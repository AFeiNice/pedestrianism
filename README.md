# 五台山徒步 · 报名网站

面向五台山徒步报名的小型单页网站：徒步者填写**姓名、手机号、预计出发日期～截止日期、人数、往返城市（全国内地省→市两级联动）、是否需要住宿及住宿选择、是否需要租赁穿戴设备**，提交后自动将内容发送到报名邮箱 `13233508884@163.com`。

- 移动端 / PC 端自适应，苹果官网风格，滚动丝滑。
- 纯静态 HTML / CSS / JS，无构建步骤、无打包器，托管即用。
- 报名表单通过第三方 **FormSubmit** 发邮件，无需自建服务器。
- 已部署在 GitHub Pages：`https://AFeiNice.github.io/pedestrianism/`（推送到 `main` 分支自动发布）。

## 功能特性

页面从上到下共 12 个板块，单页锚点导航：

| 板块            | 说明                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| 导航栏          | 固定顶部，锚点跳转各板块，右侧「立即报名」按钮                                                               |
| Hero 首屏       | 标题、副标题、报名 / 图集入口，滚动指示箭头                                                                  |
| 介绍 intro      | 三张卡片：五台连穿、多种路线、贴心保障                                                                       |
| 季节 season     | 按季节的装备参考（夏 / 春秋 / 冬）+ 按月的气温与景色参考表                                                   |
| 图集 gallery    | 视频封面 + 图片轮播，懒加载只拉当前张和下一张                                                                |
| 行程费用 tour   | 跟团·五台山大朝台：顺朝 / 逆朝 58km 三天两晚、大圆满 78km 四天三晚，费用卡（¥999 / ¥1299）可点击跳转路线对比 |
| 快速选择 routes | 路线对比：桌面端对比表 / 移动端卡片（≤900px 自动切换），点费用卡跳转到此处并高亮对应路线                     |
| 装备 gear       | 徒步装备清单                                                                                                 |
| 常见问题 faq    | 8 条问答，含报名流程、不收款声明、退款规则、保险、安全性                                                     |
| 报名表单 signup | 含信任卡片（报名流程 + 不收款声明 + 退款规则）、城市两级联动、住宿/设备条件显示、全部校验                    |
| 页脚 footer     | 版权信息                                                                                                     |
| 悬浮群卡片      | 固定右下角「徒步组队群 · 微信 AFeiNice」，可复制微信号、可关闭，微信内自动上移避开底部工具条                 |

其他特性：

- 扫码渠道追踪：出租车司机专属二维码海报，扫码报名后邮件自动带「推荐人」「推荐人电话」，按司机结算推广费。
- 信任与安全：报名页顶部有信任卡片，明确「线上不收款」、退款规则、隐私承诺，降低徒步者对纯网址报名的顾虑。
- 滚动显现动画：卡片进入视口由 IntersectionObserver 触发上移显现，交错错开（Apple 风格）。

## 目录结构

```
├── index.html            # 唯一单页网站（导航/首页/介绍/季节/图集/行程/快速选择/装备/FAQ/报名/页脚）
├── css/
│   └── style.css         # 全部样式，移动端优先，含卡片动效、悬浮卡、日期控件兼容
├── js/                   # 脚本按固定顺序加载，经 window 全局对象通信（ES5 IIFE，无 module）
│   ├── config.js         # window.APP_CONFIG.API_URL：表单提交地址（当前指向 FormSubmit）
│   ├── cities.js         # window.CITIES：全国省→地级市两级联动数据
│   ├── gallery.js        # 图集轮播（视频封面 + 图片），懒加载
│   ├── routes.js         # 单一 ROUTES 数据源，双端渲染路线对比表/卡片 + 点击高亮跳转
│   └── main.js           # 导航、滚动动画、城市联动、条件显示、全部表单校验与提交
├── assets/
│   └── img/              # 图集图片与视频（placeholder-N.jpg / placeholder.mp4）
├── tools/
│   └── make_driver_posters.py  # 司机推广二维码海报生成脚本（输出到桌面）
└── server/               # 自建邮件服务（Node.js + Express + Nodemailer，历史方案）
    ├── server.js
    ├── package.json
    └── .env.example
```

> `server/` 是历史方案，**线上表单不走这个服务**，只有本地调试自建收发信时才需要；`.env` 含真实 SMTP 凭据，已被 `.gitignore` 排除，绝不能提交。

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

### 本地提交的注意事项

- FormSubmit 按来源域名单独激活：线上域名 `AFeiNice.github.io` 已激活可正常提交；从 `localhost` 提交会提示 _"This form needs Activation"_，需要去收件邮箱点激活邮件后才能用，属正常现象，不是代码 bug。
- 因此本地联调时，若只想验证表单 UI / 校验，可以忽略提交后的激活提示；要验证邮件内容，请使用线上域名或先激活 localhost。

## 司机推广二维码海报

给出租车司机生成专属二维码海报，用于线下推广。每张海报的二维码指向：

```text
https://AFeiNice.github.io/pedestrianism/?src=司机名&phone=手机号
```

### 机制

1. 司机海报上的二维码自带渠道参数 `src`（司机名）和 `phone`（司机手机号）。
2. 徒步者扫码打开报名页，页面自动把「推荐人 = 司机名」填入并锁定（不可修改），无码的徒步者可手动填推荐人兜底。
3. 提交报名后，邮件里自动带上 **「推荐人」** 和 **「推荐人电话」**。
4. 你看邮件里的「推荐人：张师傅」就知道是哪位司机拉来的报名，按约定给司机结算推广费（如坐车 + ¥30）。

### 前提

- 已安装 Python3，并安装依赖：`pip3 install qrcode pillow`
- 桌面存在海报模板底图 `~/Desktop/1-报名二维码-v2.png`（脚本从桌面读取，不会复制进项目）

### 使用

```bash
cd tools
python3 make_driver_posters.py "张师傅" "李师傅,13800000000" "王师傅"
```

- 带手机号用 **「姓名,手机号」** 格式；不带手机号只写姓名（邮件里就没有「推荐人电话」）。
- 海报输出到 `~/Desktop/driver-posters/`，文件名为「司机名-海报.png」（生成文件放桌面，不占用项目目录）。
- 也可不传参数，直接修改脚本里的 `DRIVERS` 列表后运行。

### 常见问题

- 提示 `未找到底图`：说明桌面上没有 `1-报名二维码-v2.png`，把海报模板放回桌面即可。
- 想改底图布局（二维码位置、姓名留白）：改脚本顶部的 `QR_BOX / CARD_X0/X1 / LABEL_Y0/Y1` 坐标常量。

## 部署

前端是纯静态页面，可部署到任意静态托管（GitHub Pages、Netlify、Vercel、腾讯云 COS、阿里云 OSS 等），把**根目录文件**上传即可。

本项目当前使用 GitHub Pages：

- 推送到 `main` 分支自动发布，地址 `https://AFeiNice.github.io/pedestrianism/`。
- 部署有约 1~2 分钟延迟；线上 HTML 缓存较短（max-age=600），改版时给 css/js 加版本号参数（`?v=N`）强制刷新用户缓存。

邮件服务需要单独跑在一个能运行 Node.js 的环境（仅当你改用自建服务时）：

- 小 VPS：`cd server && npm install`，填好 `.env` 后用进程管理工具（pm2 / systemd）常驻运行。
- Render / Railway 等免费平台：部署 `server/` 目录，配置环境变量 `SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / MAIL_TO`。

部署后把 [js/config.js](js/config.js) 里的 `API_URL` 改成邮件服务的完整地址，例如：

```js
window.APP_CONFIG.API_URL = 'https://your-mailer.example.com/api/send';
```

跨域已默认放开（`Access-Control-Allow-Origin: *`）；如需收紧，可在服务端 `.env` 中设置 `ALLOWED_ORIGINS`。

## 报名表单字段

| 字段                 | 校验                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- |
| 姓名                 | 必填，1~30 字                                                                           |
| 手机号               | 必填，`^1[3-9]\d{9}$`                                                                   |
| 预计出发日期         | 必填，不得早于今天                                                                      |
| 截止日期             | 必填，不得早于出发日期                                                                  |
| 人数                 | 必填，1~99，支持步进按钮                                                                |
| 往返城市             | 必填，省→市两级联动                                                                     |
| 推荐人               | 选填；扫码自动填入并锁定，否则可手填（兜底）                                            |
| 是否需要住宿         | 必填，是 / 否                                                                           |
| 住宿选择             | 选「是」时必填：合租 / 整间大床 / 双床                                                  |
| 住宿数量             | 选「是」时必填：合租选床铺个数，整间大床/双床选房间间数（1~99）                         |
| 是否需要租赁穿戴设备 | 必填，是 / 否                                                                           |
| 租赁设备             | 选「是」时必填，多选：登山杖/冲锋衣/羽绒服/登山鞋/睡袋/头灯/护膝/雨衣/防寒手套/登山背包 |

住宿、设备相关字段通过 `.field.is-hidden` 控制显示/隐藏，提交时按需把「床铺数量」或「房间数量」写入邮件。

### 提交邮件字段

提交后发到报名邮箱的邮件内容按固定顺序包含：姓名、手机号、预计出发日期、截止日期、人数、往返城市、住宿相关、设备相关、推荐人、推荐人电话（有渠道码时）、提交时间等。

## 技术说明

- **无构建**：没有构建 / lint / 测试脚本，改完直接用。
- **脚本加载顺序**：`config → cities → gallery → routes → main`（见 `index.html` 底部）。脚本经 `window` 全局对象通信：`routes.js` 生成的路线卡片要赶在 `main.js` 的 `.reveal` 观察之前渲染，顺序不能乱。
- **城市数据**：`cities.js` 由开源数据集 [modood/Administrative-divisions-of-China](https://github.com/modood/Administrative-divisions-of-China)（MIT）的 `dist/pca.json` 解析出省→地级市两级，直辖市直接归并为本市。
- **图片 / 视频**：部署在 GitHub Pages，国内访问 `raw.githubusercontent.com` 被墙，务必用 Pages 地址测试；视频必须是 **H.264** mp4（HEVC 在 Chrome/微信里黑屏）；图片保持压缩（`sips -Z 1280 -s format jpeg -s formatOptions 65`），控制体积避免国内加载过慢。
- **移动端横向滚动**：`overflow-x: hidden` 必须同时加在 `html` 和 `body`（仅 body 在 iOS/微信里不够）。
- **日期控件宽度**：微信 iOS 内置浏览器会给原生 `input[type=date]` 注入大 `min-width`，用 `.date-wrap` flex 弹性收缩（`width:0 + flex:1 + min-width:0 !important`）强制不超出容器。
- **悬浮群卡片**：默认常显，点关闭后本次会话不再显示（sessionStorage）；微信内自动上移（`body.is-wechat`）避开底部工具条。

## 测试

仓库内没有自动化测试，但开发时用 headless Chrome（puppeteer-core）脚本在 `/tmp/uitest/` 对 320~1280px 多宽度检查横向溢出与 DOM 结构、表单提交载荷（通过拦截 POST 请求捕获）。改完 UI 后跑一遍，重点确认 `scrollWidth - clientWidth` 为 0。

## 数据来源

城市数据生成自 `modood/Administrative-divisions-of-China` 的 `dist/pca.json`（MIT），实现时按最新版本解析出省→地级市两级；直辖市直接归并为本市。如需更新，重新抓取该文件并运行同样的转换即可。

## 开发制作者

- 开发制作者：**袁老四**
- 合作联系方式：**vx：AFeiNice**
