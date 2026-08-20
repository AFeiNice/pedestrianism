# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

五台山徒步报名单页网站：静态 HTML/CSS/JS，无构建步骤、无打包器、无测试。报名表单提交后通过第三方 **FormSubmit** 服务把内容发邮件到 `13233508884@163.com`，无需自建服务器。部署在 GitHub Pages：`https://AFeiNice.github.io/pedestrianism/`（推送到 `main` 分支自动发布）。

## 常用命令

没有构建 / lint / 测试脚本。本地联调用任意静态服务器托管根目录：

```bash
python3 -m http.server 3000   # 然后打开 http://localhost:3000
```

`server/` 目录还保留了一个 Express+Nodemailer 的自建邮件服务（历史方案），本地联调需配好 `.env` 后 `cd server && npm install && node server.js`（会在 3000 端口同时托管站点和 `/api/send`）。**线上表单不走这个服务**，除非用户明确要求改造，不要动它。

## 架构

脚本按固定顺序加载（见 `index.html` 底部），彼此通过 `window` 上的全局对象通信，全部是 ES5 风格 IIFE（`var`、无 module）：

1. `js/config.js` → `window.APP_CONFIG.API_URL`，表单提交后端地址（当前指向 FormSubmit）
2. `js/cities.js` → `window.CITIES`，全国省→地级市两级联动数据（MIT 开源数据集转换而来）
3. `js/gallery.js` → 图集轮播（视频封面 + 图片），懒加载只拉当前张和下一张
4. `js/main.js` → 导航、滚动动画、城市联动、条件显示（住宿/设备）、全部表单校验与提交

`index.html` 是唯一页面，含导航、Hero、介绍、图集、报名表单、页脚。报名表单字段与校验规则集中在 `js/main.js` 的 `validators` / `fieldMap` 对象里；住宿和设备字段通过 `.field.is-hidden` 控制显示/隐藏，提交时按需把「床铺数量」或「房间数量」字段名写入邮件。

## 关键注意事项

- **表单提交的坑**：FormSubmit 的激活是按来源域名单独算的。线上域名 `AFeiNice.github.io` 已激活可正常提交；从 `localhost` 提交会报 *"This form needs Activation"*，需要在收件邮箱点击激活邮件后才能用，属正常现象，不是代码 bug。
- **媒体文件**：部署在 GitHub Pages，国内访问 `raw.githubusercontent.com` 被墙，务必用 Pages 地址测试图片/视频。视频必须是 **H.264** mp4（HEVC 在 Chrome/微信里黑屏）；图片保持压缩（`sips -Z 1280 -s format jpeg -s formatOptions 65`），控制体积避免国内加载过慢。
- **安全**：`server/.env` 含真实 SMTP 凭据，已被 `.gitignore` 排除，**绝不能提交**。`.env.example` 里只放占位符。
- **提交风格**：git commit message 用简短中文描述改动。
