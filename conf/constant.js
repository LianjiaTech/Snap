var local_constant = {};
try {
  local_constant = require('./local_constant');
} catch (e) {
}

// Puppeteer Launch Args
PUPPETEER_LAUNCH_SINGLE_PROCESS_ARG = '--single-process';
PUPPETEER_LAUNCH_ARGS = local_constant.PUPPETEER_LAUNCH_ARGS || [
  '--disable-gpu', // 禁用 GPU 硬件加速。 如果软件渲染器没有到位，那么 GPU 进程将不会启动。
  '--disable-background-networking', // 禁用几个在后台运行网络请求的子系统。 这是在进行网络性能测试时使用，以避免测量中的噪声。
  '--disable-breakpad', // 禁用崩溃报告。
  '--disable-component-update', // 禁用组件更新？
  '--disable-dev-shm-usage', // /dev/shm 分区在某些 VM 环境中太小，导致 Chrome 失败或崩溃（参见 http://crbug.com/715363）。 使用此标志来解决此问题（将始终使用临时目录来创建匿名共享内存文件）。
  '--disable-domain-reliability', // 禁用域可靠性监控。
  '--disable-extensions', // 禁用扩展
  '--disable-features=AudioServiceOutOfProcess', // 禁用音频沙盒功能
  '--disable-hang-monitor', // 禁止在渲染器进程中挂起监视器对话框。(选项卡允许直接关闭)
  '--disable-ipc-flooding-protection', // 禁用 IPC 泛洪保护。 默认情况下已激活。 一些 javascript 函数可用于使用 IPC 淹没浏览器进程。 这种保护限制了它们的使用速率。
  '--disable-notifications', // 禁用 Web 通知和推送 API。
  '--disable-popup-blocking', // 禁用弹出窗口阻止。
  '--disable-print-preview', // 禁用打印预览
  '--disable-prompt-on-repost', // 禁用 prompt。此开关一般在自动化测试期间使用。
  // '--disable-renderer-backgrounding', // 禁止后台渲染
  '--disable-setuid-sandbox', // 禁用 setuid 沙箱（仅限 Linux）
  '--disable-speech-api', // 禁用 Web Speech API（语音识别和合成）。
  '--hide-scrollbars', // 从屏幕截图中隐藏滚动条。
  '--metrics-recording-only', // 启用指标记录，但禁用报告。
  '--mute-audio', // 静音音频
  '--no-default-browser-check', // 禁用默认浏览器检查。
  '--no-first-run', // 跳过首次运行任务
  '--no-pings', // 不发送超链接审核 ping
  '--no-sandbox', // 禁用沙箱
  '--no-zygote', // 禁止使用 zygote 进程来派生子进程。 相反，子进程将被 fork 并直接执行。
  '--password-store=basic', // 使用基础的密码保存
  // '--use-gl=swiftshader', // 选择 GPU 进程应使用的 GL 实现。使用 SwiftShader 软件渲染器
  '--use-mock-keychain', // 使用 mock-keychain 防止提示权限提示
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
