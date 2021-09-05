## 环境依赖

* 安装 Node
  * https://nodejs.org/zh-cn/download/

* 安装 node_modules
    ```shell
    npm ci
    ```

## 本地运行

* 启动
    ```shell
    npm run node-debug
    ```

* 地址
    ```shell
    http://127.0.0.1:3000/api/shot?url=https%3A%2F%2Fwww.baidu.com%2F
    ```

## 线上部署

* PM2
    ```shell
    npm run deploy
    ```

## 接口文档

* 参数

    | 属性 | 类型 | 默认值 | 必填 | 说明 |  
    | ---- | ---- | ---- | ---- | ---- |
    | src/source |  |  | 否 | 调用方 标识 |
    | callback |  |  | 否 | JSONP 回调函数，不传为非 JSONP 请求 |
    | cache |  | 0 | 否 | 是否启用缓存，1是0否 |
    | type |  | data | 否 | 返回类型，data文件url链接 |
    | resheaders |  |  | 否 | Response Headers，当 type == "data" 时生效 |
    | url |  |  | 是 | urls/url必有其一，待截图页面链接，GET请求需进行 urlencode |
    | name |  |  | 否 | 截图名称，当 type == "data" 时生效 |
    | c |  |  | 否 | 待截图页面COOKIES，[{"name": "name", "value": "value", "domain": "domain"}]，GET请求需进行 JSON.stringfy 和 urlencode |
    | urls |  |  | 是 | urls/url必有其一，待截图页面链接，GET请求需进行 JSON.stringfy 和 urlencode |
    |  - urls.url |  |  | 是 | 待截图页面链接 |
    |  - urls.name |  |  | 否 | 截图名称 |
    |  - urls.cookies |  |  | 否 | 待截图页面COOKIES |
    | s |  |  | 否 | 待截图页面元素，GET请求需进行 urlencode |
    | m |  | 0 | 否 | 是否为移动端，1是0否，为移动端时，模拟器为 iPhone 6 |
    | f |  | 1 | 否 | 是否全屏截屏，1是0否，为1时全屏高度貌似为html元素的高度 |
    | fs |  |  | 否 | 获取全屏宽高页面元素，默认 document.body.scrollWidth/document.body.scrollHeight |
    | x |  | 0 | 否 | 截屏左上角x坐标 |
    | y |  | 0 | 否 | 截屏左上角y坐标 |
    | w |  |  | 否 | 截屏宽度 |
    | h |  |  | 否 | 截屏高度 |
    | t |  | 500 | 否 | 预留页面渲染时间，单位为毫秒(ms) |
    | ts |  | 0 | 否 | 截图当前时间戳 |
    | scale |  | 1 | 否 | 页面的缩放（可以认为是 dpr） |
    | actions |  |  | 否 | 页面操作，GET请求需进行 JSON.stringfy 和 urlencode |
    |  - actions.event |  |  | 否 | 页面操作类型，支持类型：init(初始化)/click(点击)/back(返回)/wait(停留) |
    |  - actions.selector |  |  | 否 | 页面操作元素 |
    |  - actions.time |  |  | 否 | 页面操作后，预留页面渲染时间，单位为毫秒(ms) |
    |  - actions.name |  |  | 否 | 页面操作后，截图名称 |
    |  - actions.snap |  |  | 否 | 页面操作后，是否截图，1是0否，默认1 |
    |  - actions.html |  |  | 否 | 页面操作后，是否保存页面，1是0否，默认0 |

* 调用

  * `GET` or `POST` or `JSONP`
  * Content-Type 支持
    * application/json
    * application/x-www-form-urlencoded


## 注意事项

* 全屏截屏
  * 全屏高度貌似为html元素的高度
  * 元素勿使用 `height: 100%` 之类的属性

## TODO

* 功能类
  * 调用数据存储 √
  * 调用数据统计 √
  * 图片上传S3
  * 过期本地图片
  * 支持截图名称 √
  * 支持RPC调用
  * 支持异步回调
  * 支持主动查询 √
  * 支持Websocket推送

* 优化类
  * 截图失败重试 √
  * type=data占位图
  * 截小图拼大图 √
  * 优化异常处理 √
  * 批量并发处理
  * 截小图并发处理
  * 封装请求参数 √
  * 封装返回函数 √
  * 系统日志优化

* 部署类
  * 生成Docker镜像

## Why’s The Design
* 截小图拼大图
  * [Chrome seems to have a hard limit when taking screenshots of long pages](https://github.com/puppeteer/puppeteer/issues/359)
  * [devtools-frontend/front_end/emulation/DeviceModeModel.js](https://github.com/ChromeDevTools/devtools-frontend/blob/master/front_end/panels/emulation/DeviceModeModel.js#L862)
    ```javascript
    // Cap the height to not hit the GPU limit.
    const contentHeight = Math.min((1 << 14), metrics.contentHeight);
    clip = {x: 0, y: 0, width: Math.floor(metrics.contentWidth), height: Math.floor(contentHeight), scale: 1};
    ```
  * 上限 — 1 << 14 — 16384px
  * 导致超过上限的图截取不全
  * 所以设计成，宽或高超过上限，就拆成最大 `16384px * 16384px` 的小图，截取之后再合成一张大图

## 版本记录
[CHANGELOG](/CHANGELOG.md)

## License
[MIT](http://opensource.org/licenses/MIT)

Copyright(c) 2021 Lianjia, Inc. All Rights Reserved
