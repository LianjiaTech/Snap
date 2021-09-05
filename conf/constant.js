var local_constant = {};
try {
  local_constant = require('./local_constant');
} catch (e) {
}

module.exports = Object.assign({}, {
  // Project
  PROJECT_LINK: null,
  // 域名
  DOMAIN: null,
  // 数据库
  DATABASE: null,
  // 启动浏览器数量
  MAX_BROWSER_WSENDPOINT_NUM: 4,
  // 启动浏览器参数
  PUPPETEER_LAUNCH_OPTIONS: {
    headless: true,
    timeout: 0,
    ignoreHTTPSErrors: true,  // 忽略证书错误
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      // https://github.com/puppeteer/puppeteer/issues/1947
      // '--single-process'
      // 与
      // var context = await browser.createIncognitoBrowserContext();
      // 冲突
      // '--single-process',
      // '--incognito',  // 无痕模式、隐身模式
    ]
  },
  // 模拟器手机型号
  EMULATE_PHONE: 'iPhone 6',
  // 缩放比例
  DEVICE_SCALE_FACTOR: 3,
  // Merge Image
  // https://github.com/ChromeDevTools/devtools-frontend/blob/12fed693c9e273a68d1a84865d798f3bcdc7ad27/front_end/panels/emulation/DeviceModeModel.js#L862
  MAX_SCREENSHOT_WIDTH: 1 << 14,
  MAX_SCREENSHOT_HIGHT: 1 << 14,
  // Path
  STATIC_BASE_DIRNAME: 'public',
  STATIC_MEDIA_DIRNAME: 'media',
  // Nginx
  CLIENT_MAX_BODY_SIZE: '100kb',
}, local_constant);
