module.exports.isEmpty = function isEmpty(obj) {
  return obj == null || (obj.trim && obj.trim() === '')
}