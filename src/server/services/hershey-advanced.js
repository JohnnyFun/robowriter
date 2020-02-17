/* 
wrapper for the hershey advanced cli
*/
const cli = require('./cli')
const path = require('path')
const { createTempFile, readTempFile, delTempFile, resolveTempFileName } = require('./tempfiles')
const { isEmpty } = require('../../shared/string-utils')
const { fonts } = require('../../shared/constants')

module.exports.convertTextToPaths = function convertTextToPaths(opts, onData) {
  const handleErr = err => {
    console.error(err)
    onData({ error: err.stack })
  }
  if (isEmpty(opts.inputFile)) return handleErr(new Error('opts.inputFile is required'))
  const inputFile = `./${new Date().getTime()}.svg`
  const outputFile = `${inputFile.replace(/\.svg$/, '')}-hersheyified.svg`
  createTempFile(inputFile, opts.inputFile).then(() => {
    // TODO: client-side should pass in enableDefects=true and values to go with it (see hershey-cli-help.txt) values and store them in localstorage settings
    let args = [
      '--fontface=other',
      `--otherfont=${path.resolve(__dirname, '../', fonts.QEMeganRikliCAP)}`,
      resolveTempFileName(inputFile),
      resolveTempFileName(outputFile)
    ]
    cli('hta', args, d => {
      if (d.done) {
        delTempFile(inputFile).catch(handleErr)
        onData(d)
        readTempFile(outputFile)
          .then(preview => {
            onData({ preview })
            delTempFile(outputFile).catch(handleErr)
          })
          .catch(handleErr)
      } else {
        onData(d)
      }
    })
  }).catch(handleErr)
}