var lib = require('../utils/lib');

module.exports = function (req, res, next) {
  console.log('>>> Request GET: ', req.query);
  console.log('>>> Request POST: ', req.body);

  var data = lib.isEmpty(req.query) ? req.body : req.query;
  data = lib.jsonParse(data, dft = {});
  console.log('>>> Request Data: ', data);

  req.data = data;

  next();
};
