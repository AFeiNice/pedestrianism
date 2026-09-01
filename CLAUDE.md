# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

五台山徒步报名单页网站：静态 HTML/CSS/JS，无构建步骤、无打包器、无测试脚本。报名表单提交后通过第三方 **FormSubmit** 服务把内容发邮件到 `13233508884@163.com`，无需自建服务器。部署在 GitHub Pages：`https://AFeiNice.github.io/pedestrianism/`（推送到 `main` 分支自动发布）。

## 常用命令

没有构建 / lint / 测试脚本。本地联调用任意静态服务器托管根目录：

```bash
python3 -m http.server 3000   # 然后打开 http://localhost:3000
```

`server/` 目录还保留了一个 Express+Nodemailer 的自建邮件服务（历史方案），本地联调需配好 `.env` 后 `cd server && npm install && node server.js`（会在 3000 端口同时托管站点和 `/api/send`）。**线上表单不走这个服务**，除非用户明确要求改造，不要动它。

**UI 改动验证**：仓库内没有自动化测试，但本会话固定用 headless Chrome（puppeteer-core）脚本在 `/tmp/uitest/` 对 320~1280px 多宽度检查横向溢出与 DOM 结构。改完 UI 后用 `cd /tmp/uitest && node test*.mjs`（需先起本地服务器）跑一遍，重点确认 `scrollWidth - clientWidth` 为 0。

## 架构

脚本按固定顺序加载（见 `index.html` 底部），彼此通过 `window` 上的全局对象通信，全部是 ES5 风格 IIFE（`var`、无 module）：

1. `js/config.js` → `window.APP_CONFIG.API_URL`，表单提交后端地址（当前指向 FormSubmit）
2. `js/cities.js` → `window.CITIES`，全国省→地级市两级联动数据（MIT 开源数据集转换而来）
3. `js/gallery.js` → 图集轮播（视频封面 + 图片），懒加载只拉当前张和下一张
4. `js/routes.js` → 路线对比：单一 `ROUTES` 数据源双端渲染（桌面 `.routes-table` 对比表 / 移动端 `.routes-cards` 卡片，≤900px 切换）；`data-route` 费用卡点击跳转 `#routes` 并高亮对应列/卡片
5. `js/main.js` → 导航、滚动动画、城市联动、条件显示（住宿/设备）、全部表单校验与提交

`index.html` 是唯一页面，从上到下依次：导航、Hero、介绍(intro)、季节(season)、图集(gallery)、行程费用(tour)、快速选择(routes)、装备(gear)、常见问题(faq)、报名表单(signup)、页脚。报名表单字段与校验规则集中在 `js/main.js` 的 `validators` / `fieldMap` 对象里；住宿和设备字段通过 `.field.is-hidden` 控制显示/隐藏，提交时按需把「床铺数量」或「房间数量」字段名写入邮件。

### 滚动显现动画（Apple 风格）

- 全局 `.reveal` 初始 `opacity:0` + 上移微缩，进入视口由 `js/main.js` 的 IntersectionObserver（threshold 0.12）加 `.in-view` 触发过渡。
- 卡片交错用 CSS 变量 `--reveal-delay` 错开：intro / season / faq 卡片走 `nth-child` 规则，routes 卡片由 `js/routes.js` 渲染时内联设置。
- 轻按 / 悬停反馈集中在 `css/style.css` 末尾的「卡片动效」块：`:active` 轻按 `scale(0.97)`、悬停上浮 + 阴影、`-webkit-tap-highlight-color: transparent`。
- 注意脚本顺序：routes 卡片在 `main.js` 之前生成，`main.js` 里的 `$$('.reveal')` 才能把它们纳入观察。

## 关键注意事项

- **表单提交的坑**：FormSubmit 的激活是按来源域名单独算的。线上域名 `AFeiNice.github.io` 已激活可正常提交；从 `localhost` 提交会报 *"This form needs Activation"*，需要在收件邮箱点击激活邮件后才能用，属正常现象，不是代码 bug。
- **媒体文件**：部署在 GitHub Pages，国内访问 `raw.githubusercontent.com` 被墙，务必用 Pages 地址测试图片/视频。视频必须是 **H.264** mp4（HEVC 在 Chrome/微信里黑屏）；图片保持压缩（`sips -Z 1280 -s format jpeg -s formatOptions 65`），控制体积避免国内加载过慢。
- **移动端横向滚动**：`overflow-x: hidden` 必须同时加在 `html` 和 `body`（仅 body 在 iOS/微信里不够）。原生 `date` 控件有固有宽度，在 grid/flex 里要 `min-width: 0` 防止撑破行（`.field` 已带）。
- **安全**：`server/.env` 含真实 SMTP 凭据，已被 `.gitignore` 排除，**绝不能提交**。`.env.example` 里只放占位符。
- **提交风格**：git commit message 用简短中文描述改动。
