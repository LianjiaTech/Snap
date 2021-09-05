var fs = require('fs');
var path = require('path');

var express = require('express');
var router = express.Router();
var compressing = require('compressing');
var md5 = require('md5');
var mergeimg = require('merge-img');
var puppeteer = require('puppeteer');
var ShortUUID = require('shortuuid');

var lib = require('../utils/lib');

var shortuuid = new ShortUUID();


async function get_selector_rect(page, selector) {
  return rect = await page.evaluate(selector => {
    try {
      const ele = document.querySelector(selector);
      const {x, y, width, height} = ele.getBoundingClientRect();
      if (width * height != 0) {
        return {left: x, top: y, width, height, id: ele.id};
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }, selector)
}

async function final_exec_snapshot(program, page, time, final_store_path) {
  var width = parseInt(program.width || 1920);
  var height = parseInt(program.height || 1080);
  var scale = Math.ceil(program.scale || constant.DEVICE_SCALE_FACTOR);

  var rect = null;

  // 选择器截屏
  if (program.selector) {
    await page.waitForTimeout(program.selector);

    // 预留一定的渲染时间
    await page.waitForTimeout(time);

    var selectorHandle = await page.$(program.selector);
    if (selectorHandle) {
      rect = await get_selector_rect(page, program.selector);

      // 重新设置 viewport
      // 如若不重新设置
      // 一旦 `rect.width` 超过原先设置的 viewport
      // 则截图位置会产生偏移
      if (rect) {
        await page.setViewport({
          width: parseInt(rect.width || width),
          height: parseInt(rect.height || height),
          deviceScaleFactor: scale
        });
      }

      await selectorHandle.screenshot({
        path: final_store_path,
      });

      await selectorHandle.dispose();

      return
    }

    console.log('Selector fail, fallback snapshot url')
  } else {
    // 预留一定的渲染时间
    await page.waitForTimeout(time);
  }

  // 整页截屏
  // if (program.fullPage) {  // 全屏截屏
  //   await page.screenshot({
  //     path: final_path,
  //     fullPage: true
  //   });
  // } else {  // 指定区域截屏
  //   await page.screenshot({
  //     path: final_path,
  //     clip: {
  //       x: parseInt(program.x || 0),
  //       y: parseInt(program.y || 0),
  //       width: width,
  //       height: height
  //     }
  //   });
  // }

  var x = null, y = null, totalWidth = null, totalHeight = null;
  if (program.fullPage) {  // 全屏截屏
    if (program.fullSelector && await page.$(program.fullSelector)) {
      rect = await get_selector_rect(page, program.fullSelector);
    }
    if (!rect) {
      rect = await page.evaluate(selector => {
        return {
          'width': document.body.scrollWidth,
          'height': document.body.scrollHeight
        }
      });
    }
    console.log('>>> Document boundingBox', rect);
    x = 0, y = 0;
    totalWidth = rect.width, totalHeight = rect.height;
  } else {  // 指定区域截屏
    x = parseInt(program.x || 0), y = parseInt(program.y || 0), totalWidth = width, totalHeight = height;
  }
  var screenWidth = Math.floor(constant.MAX_SCREENSHOT_WIDTH / program.scale),
    screenHeight = Math.floor(constant.MAX_SCREENSHOT_HIGHT / program.scale);
  var screens = [];
  var cumWidth = 0, cumHeight = 0;
  for (var i = 0; i * screenHeight < totalHeight; i++) {
    var rowScreens = [];
    var mergedRowScreen = null;
    cumWidth = 0;
    cumHeight += screenHeight;
    for (var j = 0; j * screenWidth < totalWidth; j++) {
      cumWidth += screenWidth;
      console.log(`>>> Screenshot part (${i}, ${j}) - ((${Math.min(cumWidth, totalWidth)} * ${Math.min(cumHeight, totalHeight)}) / (${totalWidth} * ${totalHeight}))`);
      var screen = await page.screenshot({
        path: ((totalWidth > screenWidth) || (totalHeight > screenHeight)) ? undefined : final_store_path,  // if only 1 screen is needed with save immediately
        clip: {
          x: x + j * screenWidth,
          y: y + i * screenHeight,
          width: cumWidth > totalWidth
            ? Math.ceil(screenWidth - (cumWidth - totalWidth))
            : screenWidth,
          height:
            cumHeight > totalHeight
              ? Math.ceil(screenHeight - (cumHeight - totalHeight))
              : screenHeight
        }
      });
      rowScreens.push(screen)
    }
    if (rowScreens.length > 1) {
      mergedRowScreen = await mergeimg(rowScreens, {
        direction: false
      })
    } else {
      mergedRowScreen = rowScreens[0];
    }
    screens.push(mergedRowScreen);
  }

  // if there was only 1 screen we already saved the file during screenshot
  if (screens.length > 1 || rowScreens.length > 1) {
    var mergedScreens = await mergeimg(screens, {
      direction: true
    });

    // Note: mergeImg relies on an old version of Jimp without writeAsync support
    // See https://github.com/preco21/merge-img/issues/6
    await new Promise((resolve, reject) => {
      mergedScreens.write(final_store_path, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

async function exec_snapshot(program, url, idx) {
  var tmp = Math.floor(Math.random() * constant.MAX_BROWSER_WSENDPOINT_NUM);
  var browserWSEndpoint = BROWSER_WSENDPOINT_LIST[tmp];
  var browser = await puppeteer.connect({browserWSEndpoint});
  console.log('>>> browserWSEndpoint: ', browserWSEndpoint);

  var width = parseInt(program.width || 1920);
  var height = parseInt(program.height || 1080);
  var scale = Math.ceil(program.scale || constant.DEVICE_SCALE_FACTOR);
  var time = parseInt(program.time || 500);
  var actions = program.actions || [];

  var final_path = null;
  var final_store_path = null;
  var final_url = url.url || url;
  var final_cookies = url.cookies || program.cookies;

  var page = null;

  // Set Cookies
  // https://stackoverflow.com/questions/60748768/puppeteer-parallel-scraping-via-multiple-pages
  if (final_cookies) {
    var context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();

    // 设置 cookies
    await page.setCookie(...lib.jsonParse(final_cookies))
  } else {
    page = await browser.newPage();
  }

  // Set viewport
  if (program.isMobile) {  // 设置模拟移动端
    var emulate_phone = puppeteer.devices[constant.EMULATE_PHONE];
    await page.emulate(emulate_phone);
    width = emulate_phone.viewport.width;
    height = emulate_phone.viewport.height;
  }
  await page.setViewport({
    width: width,
    height: height,
    deviceScaleFactor: scale
  });

  // 加载网页
  await page.goto(final_url, {
    waitUtil: 'networkidle0'
  });

  // Actions
  if (actions.length > 0) {
    for (const action of actions) {
      console.log('>>> Snap Page Click Action: ', action);
      if (action.event === 'click') {
        try {
          await page.click(action.selector);
        } catch (e) {
          console.log('>>> Snap Page Click Error: ', e.message);
          continue
        }
      } else if (action.event === 'back') {
        await page.goBack();
      } else if (action.event === 'init' || action.event === 'wait') {

      } else {
        continue
      }

      await page.waitForTimeout(action.time || time);

      if (action.snap === 0) {
        continue
      }

      final_path = path.join(program.file_path, action.name || idx);

      final_store_path = path.join(constant.STATIC_BASE_DIRNAME, final_path + '.png');
      await final_exec_snapshot(program, page, time, final_store_path);

      if (action.html === 1) {
        final_store_path = path.join(constant.STATIC_BASE_DIRNAME, final_path + '.html');
        fs.writeFileSync(final_store_path, await page.content());
      }
    }
  } else {
    if (idx >= 0) {
      final_path = path.join(program.file_path, url.name || idx);
    } else {
      final_path = program.file_path;
    }
    final_store_path = path.join(constant.STATIC_BASE_DIRNAME, final_path + '.png');
    await final_exec_snapshot(program, page, time, final_store_path);
  }

  await page.close();
}

async function do_shot(program) {
  // net::ERR_EMPTY_RESPONSE at http://baidu.com
  // Catch error to retry
  try {
    var t1 = new Date();

    if (program.urls.length === 1) {
      if (program.actions.length > 0) {
        // 删除目录
        await fs.rmdirSync(program.store_path, {recursive: true, force: true});
        // 创建目录
        await fs.mkdirSync(program.store_path);
        // 截图
        await exec_snapshot(program, program.urls[0], -1);
        // 压缩目录
        await compressing.zip.compressDir(program.store_path, program.final_store_path);
      } else {
        await exec_snapshot(program, program.urls[0], -1);
      }
    } else {
      // 删除目录
      await fs.rmdirSync(program.store_path, {recursive: true, force: true});
      // 创建目录
      await fs.mkdirSync(program.store_path);
      // 遍历截图
      for (idx in program.urls) {
        try {
          await exec_snapshot(program, program.urls[idx], idx);
        } catch (e) {
          console.log('>>> Snap Error: ', e.message)
        }
      }
      // 压缩目录
      await compressing.zip.compressDir(program.store_path, program.final_store_path);
    }

    var t2 = new Date();
    console.log('>>> Snapshot Time: ', (t2 - t1) / 1000);
  } catch (e) {
    console.log('>>> Snap Error: ', e.message)
  }
}

router.all('/shot', async function (req, res, next) {
  var snap_id = shortuuid.uuid();

  // source
  var source = req.data.src || req.data.source || '';
  // callback
  var callback = req.data.callback;
  // type
  var resptype = req.data.type || 'data';
  // urls
  var url = req.data.url;
  var urls = lib.jsonParse(req.data.urls);
  if (lib.isEmpty(url) && lib.isEmpty(urls)) {
    req.resdata = errno.ParamsStatusCode.PARAM_NOT_FOUND;
    return next();
  }
  if (!lib.isEmpty(req.data.url)) {
    urls = [url];
  }
  // actions
  var actions = lib.jsonParse(req.data.actions) || [];
  // 文件后缀 - suffix
  var suffix = urls.length === 1 ? (actions.length > 0 ? 'zip' : 'png') : 'zip';
  // file_name - xxx
  var file_name = md5(source + callback + urls + JSON.stringify(req.data.c) + req.data.s + req.data.m + req.data.f + req.data.fs + req.data.x + req.data.y + req.data.w + req.data.h + req.data.ts + req.data.scale + req.data.actions);

  // file_path - media/xxx
  var file_path = path.join(constant.STATIC_MEDIA_DIRNAME, file_name);
  // final_file_path - media/xxx.png
  //                 - media/xxx.zip
  var final_file_path = file_path + '.' + suffix;

  // store_path - public/media/xxx
  var store_path = path.join(constant.STATIC_BASE_DIRNAME, file_path);
  // final_store_path - public/media/xxx.png
  //                  - public/media/xxx.zip
  var final_store_path = path.join(constant.STATIC_BASE_DIRNAME, final_file_path);

  // path_info
  var path_info = {
    snap_id: snap_id,
    file_path: final_file_path,
    file_url: constant.DOMAIN + '/' + final_file_path,
  };

  var program = {
    urls: urls,
    actions: actions,
    suffix: suffix,
    file_path: file_path,
    store_path: store_path,
    final_store_path: final_store_path,
    cookies: lib.jsonParse(req.data.c),
    selector: req.data.s || '',
    isMobile: 1 == req.data.m,
    fullPage: 0 != req.data.f,
    fullSelector: req.data.fs || '',
    // (x, y) 截图左上角坐标
    x: req.data.x || 0,
    y: req.data.y || 0,
    // (width, height) 截图宽高
    width: req.data.w || 1920,
    height: req.data.h || 1080,
    time: req.data.t || 500,
    scale: Math.ceil(req.data.scale || constant.DEVICE_SCALE_FACTOR),
  };
  console.log('>>> Program: ', program);

  // Snapshot
  if (req.data.cache && lib.fsExistsSync(path.join(BASE_DIR, final_store_path))) {
  } else {
    await do_shot(program);
    var counter = 0;
    while (!path_info.file_path && counter < 3) {
      counter++;
      await do_shot(program);
    }
  }

  // Store
  if (query) {
    var params = [source, snap_id, JSON.stringify(req.data), JSON.stringify(path_info)];
    // reason: Error: ER_DATA_TOO_LONG: Data too long for column 'snap_req' at row 1
    try {
      query(sql.CREATE_SNAPSHOT_LOG, params);
    } catch (e) {
    }
  }
  // Response
  if (resptype === 'data') {
    resheaders = req.data.resheaders || {'Content-Type': 'application/octet-stream'};
    // Node TypeError [ERR_INVALID_CHAR]: Invalid character in header content ['Content-Disposition']
    // https://github.com/expressjs/express/issues/3401
    resheaders['Content-Disposition'] = 'attachment;filename="' + (encodeURIComponent(req.data.name).replace('"', '\"') + '.' + suffix || path.basename(path_info.file_path)) + '"';
    res.sendFile(path_info.file_path, options = {
      root: path.join(BASE_DIR, constant.STATIC_BASE_DIRNAME),
      headers: resheaders,
    });
  } else {
    req.resdata = path_info;
    return next();
  }
});

router.all('/shot/detail', async function (req, res, next) {
  if (!query) {
    req.resdata = errno.SupportStatusCode.QUERY_NOT_SUPPORT;
    return next();
  }

  // snap_id
  var snap_id = req.data.snap_id;

  // Query
  var results = await query(sql.QUERY_SNAPSHOT_LOG, [snap_id]);
  var path_info = !lib.isEmpty(results) ? JSON.parse(results[0].snap_res) : null;

  req.resdata = path_info;
  return next();
});

module.exports = router;
