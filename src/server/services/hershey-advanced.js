/* 
wrapper for the hershey advanced cli
*/
const cli = require('./cli')
const path = require('path')
const { createTempFile, readTempFile, delTempFile, resolveTempFileName } = require('./tempfiles')
const axidraw = require('./axidraw')
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

  // see hershey-cli-help.txt for detailed explanation of these
  const defects = [
    '--enableDefects=True',
    '--baselineVar=25',
    '--indentVar=25',
    '--kernVar=25',
    '--sizeVar=20',
    // '--rSeed=1.00'
  ]

  createTempFile(inputFile, opts.inputFile).then(() => {
    let args = [
      ...defects,
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
          .then(hersheyified => {
            onData({ preview: hersheyified })
            axidraw.printPreview({ inputFile: hersheyified }, onData)
            delTempFile(outputFile).catch(handleErr)
          })
          .catch(handleErr)
      } else {
        onData(d)
      }
    })
  }).catch(handleErr)
}