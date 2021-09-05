module.exports = function (req, res, next) {
  var final_data = req.errdata || req.resdata;

  if (!final_data) {
    return next();
  }

  if (req.method == 'GET' && req.data.callback) {
    return res.jsonp(final_data || {});
  } else {
    return res.json(final_data || {});
  }
};
