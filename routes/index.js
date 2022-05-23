var fs = require('fs');
var path = require('path');

var express = require('express');
var router = express.Router();

var dayjs = require('dayjs');
var markdown = require('marked');

/* GET home page. */
router.get('/', async function (req, res, next) {
  var year = dayjs().format('YYYY');
  var ymd = dayjs().format('YYYY-MM-DD');
  var total_num = query ? (await global.query(global.sql.COUNT_SNAPSHOT_LOG))[0]['total_num'] : 0;
  var today_num = query ? (await global.query(global.sql.COUNT_TIME_QUANTUM_SNAPSHOT_LOG, [ymd + ' 00:00:00', ymd + ' 23:59:59']))[0]['total_num'] : 0;
  var readme = fs.readFileSync(path.join(global.BASE_DIR, 'README.md')).toString();
  res.render('index', {
    project_link: global.constant.PROJECT_LINK,
    title: 'KeSnap',
    year: year,
    total_num: total_num,
    today_num: today_num,
    readme: readme,
    markdown: markdown,
  });
});

module.exports = router;
