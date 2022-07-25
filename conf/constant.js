var local_constant = {};
try {
  local_constant = require('./local_constant');
} catch (e) {
}

// Puppeteer Launch Args
PUPPETEER_LAUNCH_SINGLE_PROCESS_ARG = '--single-process';
PUPPETEER_LAUNCH_ARGS = local_constant.PUPPETEER_LAUNCH_ARGS || [
  '--disable-gpu',
  '--disable-extensions',  // 扩展程序
  '--disable-dev-shm-usage',
  '--disable-setuid-sandbox',
  '--no-first-run',
  '--no-sandbox',  // 沙箱功能
  '--no-zygote',
  // '--single-process',
  // '--incognito',  // 无痕模式、隐身模式
];

// https://github.com/puppeteer/puppeteer/issues/1947
// '--single-process'
// 与
// var context = await browser.createIncognitoBrowserContext();
// 冲突
// Remove Arg '--single-process'
PUPPETEER_LAUNCH_ARGS = PUPPETEER_LAUNCH_ARGS.filter(item => item !== PUPPETEER_LAUNCH_SINGLE_PROCESS_ARG);
// Add Arg '--single-process'
PUPPETEER_LAUNCH_SINGLE_PROCESS_FLAG = local_constant.PUPPETEER_LAUNCH_SINGLE_PROCESS_FLAG || false;
if (PUPPETEER_LAUNCH_SINGLE_PROCESS_FLAG) {
  PUPPETEER_LAUNCH_ARGS.push(PUPPETEER_LAUNCH_SINGLE_PROCESS_ARG)
}
// Puppeteer Launch Options
PUPPETEER_LAUNCH_OPTIONS = local_constant.PUPPETEER_LAUNCH_OPTIONS || {
  headless: true,
  devtools: false,
  timeout: 0,
  ignoreHTTPSErrors: true,  // 忽略证书错误
};
PUPPETEER_LAUNCH_OPTIONS['args'] = PUPPETEER_LAUNCH_ARGS;
console.log('>>> PUPPETEER_LAUNCH_OPTIONS: ', PUPPETEER_LAUNCH_OPTIONS);

// Puppeteer Extend Emulate Devices
var PUPPETEER_EXTEND_DEVICE_MAP = {};
for (const device of local_constant.PUPPETEER_EXTEND_DEVICES || []) {
  PUPPETEER_EXTEND_DEVICE_MAP[device.name] = device;
}
console.log('>>> PUPPETEER_EXTEND_DEVICE_MAP: ', PUPPETEER_EXTEND_DEVICE_MAP);
local_constant['PUPPETEER_EXTEND_DEVICES'] = PUPPETEER_EXTEND_DEVICE_MAP;

// Backward Compatibility
// 模拟器手机型号
local_constant['PUPPETEER_EMULATE_DEVICE'] = local_constant['EMULATE_PHONE'] || 'iPhone 6';

module.exports = Object.assign({}, {
  // 项目（Project）
  PROJECT_LINK: null,
  // 域名（Domain）
  DOMAIN: null,
  // 数据库（Database）
  DATABASE: null,
  // 启动浏览器数量
  BROWSER_WSENDPOINT_MAX_NUM: 4,
  // 浏览器重连次数
  BROWSER_WSENDPOINT_REINITIALIZE_MAX_NUM: 3,
  // 浏览器打开页面数量，设置为0则不限制
  BROWSER_PAGE_MAX_NUM: 10,
  // 启动浏览器参数
  PUPPETEER_LAUNCH_OPTIONS: PUPPETEER_LAUNCH_OPTIONS,
  // 缩放比例
  DEVICE_SCALE_FACTOR: 3,
  // Merge Image
  // https://github.com/ChromeDevTools/devtools-frontend/blob/12fed693c9e273a68d1a84865d798f3bcdc7ad27/front_end/panels/emulation/DeviceModeModel.js#L862
  SCREENSHOT_MAX_WIDTH: 1 << 14,
  SCREENSHOT_MAX_HEIGHT: 1 << 14,
  // Path
  STATIC_BASE_DIRNAME: 'public',
  STATIC_MEDIA_DIRNAME: 'media',
  // Nginx
  CLIENT_MAX_BODY_SIZE: '100kb',
  // 开发（Develop）
  PAGE_CLOSE_AFTER_SNAPSHOT: true,
  // Log
  LOG_ERROR_ENABLED: true,
  LOG_PERFORMANCE_ENABLED: true,

  PAGE_CHECK_TIMEOUT: 10 * 1000,
  WHITE_SCREEN_THRESHOLD: 1,
}, local_constant);
