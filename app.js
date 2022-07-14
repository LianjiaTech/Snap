var fs = require('fs');
var path = require('path');

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var snapRouter = require('./routes/snap');
var pageRouter = require('./routes/page');

var lib = require('./utils/lib');

global.constant = require('./conf/constant');
global.query = require('./utils/db');
global.sql = require('./utils/sql');
global.ws = require('./utils/ws');
global.errno = require('./utils/error/errno');

global.BASE_DIR = __dirname;

var requestData = require('./middleware/requestData');
var responseData = require('./middleware/responseData');

var app = express();

// view engine setup
app.set('views', path.join(global.BASE_DIR, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json({limit: global.constant.CLIENT_MAX_BODY_SIZE}));
app.use(express.urlencoded({limit: global.constant.CLIENT_MAX_BODY_SIZE, extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(global.BASE_DIR, global.constant.STATIC_BASE_DIRNAME)));

app.use(requestData);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/snap', snapRouter);
app.use('/api', snapRouter);
app.use('/page', pageRouter);

app.use(responseData);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// https://www.jianshu.com/p/9df6f684dabb
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// 存储 browserWSEndpoint 列表
global.BROWSER_WSENDPOINT_LIST = [];
global.BROWSER_WSENDPOINT_REINITIALIZE_FLAG = false;

(async () => {
  await global.ws.initBrowserWSEndpointList();
  console.log('>>> BROWSER_WSENDPOINT_LIST: ', global.BROWSER_WSENDPOINT_LIST);
})();

// Check dir exist or not
if (!lib.fsExistsSync(global.constant.STATIC_BASE_DIRNAME + '/' + global.constant.STATIC_MEDIA_DIRNAME)) {
  fs.mkdir(global.constant.STATIC_BASE_DIRNAME + '/' + global.constant.STATIC_MEDIA_DIRNAME, function () {
  });
}

module.exports = app;
