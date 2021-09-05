var fs = require('fs');

function isEmpty(obj) {
  if (!obj) {
    return true
  }
  if (obj.constructor === Object) {
    return Object.keys(obj).length === 0
  }
  return obj.hasOwnProperty('length') && obj.length === 0
}

function isObject(obj) {
  if (!obj) {
    return false
  }
  return typeof obj === 'object'
}

function jsonParse(obj, dft = []) {
  if (!obj) {
    return dft
  }
  return isObject(obj) ? obj : JSON.parse(obj)
}

// 检测文件或文件夹是否存在
function fsExistsSync(path) {
  try {
    fs.accessSync(path, fs.F_OK);
  } catch (e) {
    return false;
  }
  return true;
}

exports.isEmpty = isEmpty;
exports.isObject = isObject;
exports.jsonParse = jsonParse;
exports.fsExistsSync = fsExistsSync;
