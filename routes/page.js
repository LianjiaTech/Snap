var fs = require('fs');
var path = require('path');

var express = require('express');
var router = express.Router();

var lib = require('../utils/lib');

async function page_status_dead(urls, http_code, snap, isMobile, device, trace_id, cookies) {
  const bad_links = [];
  const snap_path = [];
  var browser = await global.ws.getBrowser();
  if (cookies) {
    var context = await browser.createIncognitoBrowserContext();
    var page = await context.newPage();
    await page.setCookie(...lib.jsonParse(cookies));
  } else {
    var page = await browser.newPage();
  }

  if (isMobile > 0) {  // 设置模拟移动
    var devices = Object.assign({}, puppeteer.devices, global.constant.PUPPETEER_EXTEND_DEVICES);
    var emulate_phone = devices[program.device] || devices[global.constant.PUPPETEER_EMULATE_DEVICE];
    await page.emulate(emulate_phone);
    width = emulate_phone.viewport.width;
    height = emulate_phone.viewport.height;
    await page.setUserAgent(emulate_phone.userAgent);
    await page.setViewport({width: width, height: height, deviceScaleFactor: scale});
  }

  var file_dir = path.join(global.constant.STATIC_BASE_DIRNAME, global.constant.STATIC_MEDIA_DIRNAME, trace_id);
  await fs.rmdirSync(file_dir, {recursive: true, force: true});
  await fs.mkdirSync(file_dir);

  for (idx in urls) {
    const link = urls[idx];
    try {
      const res = await page.goto(link, {
        waitUtil: 'networkidle0',//在 500ms 内没有任何网络连接 && “domcontentloaded” 事件触发 认为页面完成
        timeout: global.constant.PAGE_CHECK_TIMEOUT
      });
      const status = res.status();
      // 针对用户不可正常访问的链接认为是死链
      if (status >= http_code) {
        bad_links.push(link);
      }
      if (snap > 0) {
        await page.waitForTimeout(100);
        final_store_path = path.join(file_dir, idx.toString() + '.png');
        await page.screenshot({path: final_store_path, fullPage: true});
        snap_path.push(final_store_path);
      }
    } catch (e) {
      console.log('[%s] >>> bad link [%s] Error : ', trace_id, link, e.message)
      bad_links.push(link);
    }
  }
  await page.close();
  return {bad_links: bad_links, snap_path: snap_path};
}

async function page_all_href(url, cookies) {
  try {
    var browser = await global.ws.getBrowser();
    if (cookies) {
      var context = await browser.createIncognitoBrowserContext();
      var page = await context.newPage();
      await page.setCookie(...lib.jsonParse(cookies));
    } else {
      var page = await browser.newPage();
    }

    await page.goto(url, {
      waitUtil: 'networkidle0',//在 500ms 内没有任何网络连接 && “domcontentloaded” 事件触发 认为页面完成
      timeout: global.constant.PAGE_CHECK_TIMEOUT
    });
    const href_links = await page.evaluate(() => {
      const els = [...document.querySelectorAll("a")];
      return els.map(el => {
        return el.href.trim();
      })
    });
    await page.close();
    return href_links
  } catch (e) {
    console.log('[%s] >>> page_parse_href link Error : ', url, e.message)
    return []
  }
}

async function page_all_img(url, cookies) {
  try {
    var browser = await global.ws.getBrowser();
    if (cookies) {
      var context = await browser.createIncognitoBrowserContext();
      var page = await context.newPage();
      await page.setCookie(...lib.jsonParse(cookies));
    } else {
      var page = await browser.newPage();
    }
    await page.goto(url, {
      waitUtil: 'networkidle0',//在 500ms 内没有任何网络连接 && “domcontentloaded” 事件触发 认为页面完成
      timeout: global.constant.PAGE_CHECK_TIMEOUT
    });
    await page.waitForTimeout(3000);
    const imgInfoList = await page.evaluate(async (url) => {
      let imgs = [...document.querySelectorAll("img")];

      async function fetch_img_size(src) {
        const base64Reg = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i;
        const isBase64 = base64Reg.test(src);
        let size = 0;
        if (isBase64) {
          let str = src.replace(/^\s*data:image\/(png|gif|jpg);base64,/, '');
          const equalIndex = str.indexOf('=');
          if (str.indexOf('=') > 0) {
            str = str.substring(0, equalIndex);
          }
          const strLength = str.length;
          size = parseInt(strLength - (strLength / 8) * 2);
        } else {
          try {
            const res = await fetch(src, {
              method: 'HEAD'
            });
            size = res.headers.get('content-length');
          } catch (e) {
            console.log('>>> page_all_img fetch  %s Error : ', src, e.message);
          }
        }
        return size
      }

      async function img_info(img) {
        return {
          src: img.src, // 地址
          width: img.width, // 渲染宽度
          height: img.height, // 渲染高度
          naturalWidth: img.naturalWidth,  // 固有宽度
          naturalHeight: img.naturalHeight, // 固有高度
          size: await fetch_img_size(img.src), // 字节大小，除1024换KB
        };
      }

      const promises = imgs.map(async (el) => {
        if (/.(png|jpg|jpeg|gif)/g.test(el.src)) {
          return await img_info(el);
        } else {
          console.log('>>> page_all_img imgInfoList not image skip:', el.src);
        }
      });
      return await Promise.all(promises);
    }, url);


    const result = [];
    for (const r of imgInfoList) {
      if (r === null) {
      } else {
        result.push(r)
      }
    }

    console.log('[%s] >>> page_all_img imgInfoList:', url, result);
    await page.close();
    return result
  } catch (e) {
    console.log('[%s] >>> page_all_img link Error : ', url, e.message);
    return []
  }
}

router.all('/all/href', async function (req, res, next) {
  var url = req.data.url;
  var cookies = lib.jsonParse(req.data.c || req.data.cookies);
  if (lib.isEmpty(url)) {
    req.resdata = global.errno.ParamsStatusCode.PARAM_NOT_FOUND;
    return next();
  }
  console.log('>>> url: ', url);
  req.resdata = await page_all_href(url, cookies);
  return next();
});

router.all('/all/img', async function (req, res, next) {
  var url = req.data.url;
  var cookies = lib.jsonParse(req.data.c || req.data.cookies);
  if (lib.isEmpty(url)) {
    req.resdata = global.errno.ParamsStatusCode.PARAM_NOT_FOUND;
    return next();
  }
  console.log('>>> url: ', url);
  req.resdata = await page_all_img(url, cookies);
  return next();
});

router.all('/status/check', async function (req, res, next) {
  var urls = lib.jsonParse(req.data.urls);
  var http_code = req.data.http_code || 400;
  var snap = req.data.snap || 0;
  var isMobile = req.data.m || 0;
  var cookies = lib.jsonParse(req.data.c || req.data.cookies);
  var device = req.data.device || global.constant.EMULATE_PHONE;
  var trace_id = req.data.snap_trace_id;
  if (lib.isEmpty(urls)) {
    req.resdata = global.errno.ParamsStatusCode.PARAM_NOT_FOUND;
    return next();
  }
  req.resdata = await page_status_dead(req.data.urls, http_code, snap, isMobile, device, trace_id, cookies);
  return next();
});

router.all('/ws', function (req, res, next) {
  req.resdata = global.BROWSER_WSENDPOINT_LIST;
  return next();
});

module.exports = router;
