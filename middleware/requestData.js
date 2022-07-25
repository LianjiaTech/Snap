var lib = require('../utils/lib');
var ShortUUID = require('shortuuid');

var shortuuid = new ShortUUID();

module.exports = function (req, res, next) {
  console.log('>>> Request GET: ', req.query);
  console.log('>>> Request POST: ', req.body);

  var data = lib.isEmpty(req.query) ? req.body : req.query;
  data = lib.jsonParse(data, dft = {});
  console.log('>>> Request Data: ', data);

  data.snap_trace_id = Date.now() + shortuuid.uuid();
  req.data = data;
  console.log('[%s] >>> Request Data: ', data.snap_trace_id, data);

  next();
};
