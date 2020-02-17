const fs = require('fs')
const path = require('path')

module.exports.createTempFile = function createTempFile(name, contents) {
  return new Promise((res, rej) => {
    const dir = resolveTempFileName('')
    if (!fs.existsSync(dir))
      fs.mkdirSync(dir)
      
    fs.writeFile(resolveTempFileName(name), contents, 'utf8', err => {
      if (err) return rej(err)
      res()
    })
  })
}

module.exports.readTempFile = function readTempFile(name) {
  return new Promise((res,rej) => {
    fs.readFile(resolveTempFileName(name), 'utf8', (err, contents) => {
      if (err) return rej(err)
      res(contents)
    })
  })
}

module.exports.delTempFile = function delTempFile(name) {
  return new Promise((res, rej) => {
    fs.unlink(resolveTempFileName(name), err => {
      if (err) return rej(err)
      res()
    })
  })
}

module.exports.resolveTempFileName = resolveTempFileName

function resolveTempFileName(name) {
  return path.resolve(__dirname, './tempfiles', name)
}