const puppeteer = require('puppeteer');

async function _initBrowserWSEndpoint() {
  const browser = await puppeteer.launch(global.constant.PUPPETEER_LAUNCH_OPTIONS);
  return browser.wsEndpoint();
}

async function initBrowserWSEndpointList() {
  for (let i = 0; i < global.constant.BROWSER_WSENDPOINT_MAX_NUM; i++) {
    global.BROWSER_WSENDPOINT_LIST[i] = await _initBrowserWSEndpoint();
  }
}

function _addBrowserWSEndpoint(browserWSEndpoint) {
  global.BROWSER_WSENDPOINT_LIST.push(browserWSEndpoint);
}

function _delBrowserWSEndpoint(browserWSEndpoint) {
  global.BROWSER_WSENDPOINT_LIST = global.BROWSER_WSENDPOINT_LIST.filter(item => item !== browserWSEndpoint);
}

function _getBrowserWSEndpointIdx() {
  return Math.floor(Math.random() * global.BROWSER_WSENDPOINT_LIST.length);
}

function _getBrowserWSEndpoint() {
  const idx = _getBrowserWSEndpointIdx();
  return global.BROWSER_WSENDPOINT_LIST[idx];
}

async function _getRandomBrowser() {
  let browserWSEndpoint = null;
  let browser = null;
  // If `connect ECONNREFUSED ${host}:${port}`
  // Create a new browserWSEndpoint
  try {
    browserWSEndpoint = _getBrowserWSEndpoint();
    // browserWSEndpoint = 'ws://${host}:${port}/devtools/browser/<id>';
    console.log('>>> browserWSEndpoint: ', browserWSEndpoint);
    browser = await puppeteer.connect({browserWSEndpoint});
  } catch (e) {
    console.log('>>> Connect Error: ', e.message);
    _delBrowserWSEndpoint(browserWSEndpoint);
  }
  return browser;
}

async function _getReinitializeBrowser() {
  let browserWSEndpoint = null;
  let browser = null;
  // If `connect ECONNREFUSED ${host}:${port}`
  // Create a new browserWSEndpoint
  try {
    browserWSEndpoint = await _initBrowserWSEndpoint();
    _addBrowserWSEndpoint(browserWSEndpoint);
    console.log('>>> browserWSEndpoint: ', browserWSEndpoint);
    browser = await puppeteer.connect({browserWSEndpoint});
  } catch (e) {
    console.log('>>> Connect Error: ', e.message);
  }
  return browser;
}

async function _getFinalBrowser() {
  let browser = null;
  if (global.BROWSER_WSENDPOINT_REINITIALIZE_FLAG) {
    browser = await _getRandomBrowser();
  } else {
    global.BROWSER_WSENDPOINT_REINITIALIZE_FLAG = true;
    browser = await _getReinitializeBrowser();
    global.BROWSER_WSENDPOINT_REINITIALIZE_FLAG = false;
  }
  return browser;
}

async function _getBrowser() {
  let browser = null;

  browser = await _getRandomBrowser();
  if (browser) {
    return browser;
  }

  for (let i = 0; i < global.constant.BROWSER_WSENDPOINT_REINITIALIZE_MAX_NUM; i++) {
    browser = await _getFinalBrowser();
    if (browser) {
      return browser;
    }
  }

  return null;
}

async function getBrowser() {
  let browser = null;

  do {
    browser = await _getBrowser();
    if (!browser) {
      return browser;
    }
  } while (global.constant.BROWSER_PAGE_MAX_NUM && browser.pages() > global.constant.BROWSER_PAGE_MAX_NUM);

  return browser;
}

exports.initBrowserWSEndpointList = initBrowserWSEndpointList;
exports.getBrowser = getBrowser;
