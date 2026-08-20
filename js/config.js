// 全局配置：邮件服务地址
// 本地联调：用 `node server/server.js` 启动后，默认同源 /api/send 即可。
// 静态托管部署：把 API_URL 改为独立 Node 邮件服务的完整地址，例如：
//   window.APP_CONFIG.API_URL = 'https://your-mailer.example.com/api/send'
;(function () {
  var apiUrl = '/api/send';

  // 直接用浏览器打开本地 HTML（file://）时，回退到本地 3000 端口的邮件服务
  if (window.location.protocol === 'file:') {
    apiUrl = 'http://localhost:3000/api/send';
  }

  window.APP_CONFIG = {
    API_URL: apiUrl
  };
})();
