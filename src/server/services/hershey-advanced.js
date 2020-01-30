/* 
wrapper for the hershey advanced cli
*/
const cli = require('services/cli')
const fs = require('fs')
const path = require('path')
const { isEmpty } = require('../../shared/string-utils')
const { fonts } = require('../../shared/constants')

module.exports.convertTextToPaths = function convertTextToPaths(opts, onData) {
  const handleErr = err => {
    console.error(err)
    onData({ error: err.stack })
  }
  if (isEmpty(opts.inputFile)) return handleErr(new Error('opts.inputFile is required'))
  const inputFile = path.resolve(__dirname, `./${new Date().getTime()}.svg`)
  const outputFile = `${inputFile.replace(/\.svg$/, '')}-hersheyified.svg`
  fs.writeFile(inputFile, opts.inputFile, 'utf8', err => {
    if (err) return handleErr(err)
    const removeTempFile = () => {
      fs.unlink(inputFile, err => {
        if (err) return handleErr(err)
      })
    }
    // TODO: client-side should pass in enableDefects=true and values to go with it (see hershey-cli-help.txt) values and store them in localstorage settings
    let args = [
      '--fontface=other',
      `--otherfont=${path.resolve(__dirname, '../', fonts.QEMeganRikliCAP)}`,
      inputFile,
      outputFile
    ]
    cli('hta', args, d => {
      if (d.done) removeTempFile()
      onData(d)
    })
  })
}