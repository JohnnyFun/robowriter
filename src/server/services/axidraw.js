/* 
wrapper for the axidraw cli (same software inkscape uses to connect to axidraw--so you can programmatically call it without needing inkscape)
docs: https://axidraw.com/doc/py_api/"
see also: https://evilmadscience.s3.us-east-1.amazonaws.com/dl/ad/private/AxiDraw_Merge_v25_G.pdf
*/
const cli = require('./cli')
const { createTempFile, readTempFile, delTempFile, resolveTempFileName } = require('./tempfiles')
const { isEmpty } = require('../../shared/string-utils')
let axidrawCLIProcess = null // for now, only ever running one instance of axidraw. store an array if need to run multiple. and pass an id via websocket to specify which instance you want to abort for instance

module.exports.getAxiDrawMachines = function getAxiDrawMachines() {
  const opts = {
    mode: 'manual',
    manual_cmd: 'list_names'
  }
  return _executeAll(opts).then(d => {
    // TODO: parse list of names found
    const ports = []
    const auto = {
      name: 'Auto', 
      value: null 
    }
    return [
      auto,
      ...ports.map(p => ({
        name: p.path,
        manufacturer: p.manufacturer,
        value: p.path
      }))
    ]
  })
}

module.exports.print = function print(opts, onData) {
  const handleErr = err => {
    console.error(err)
    onData({ error: err.stack })
  }
  if (isEmpty(opts.inputFile)) return handleErr(new Error('opts.inputFile is required'))
  const inputFile = `./${new Date().getTime()}-printing.svg`
  createTempFile(inputFile, opts.inputFile)
    .then(() => {
      _execute({
        ...opts,
        inputFile: resolveTempFileName(inputFile)
      }, d => {
        if (d.done) {
          // delTempFile(inputFile).catch(handleErr)
        }
        onData(d)
      })
    })
    .catch(handleErr)
}

module.exports.abort = function abort() {
  if (axidrawCLIProcess) axidrawCLIProcess.kill()
}

// same as _execute but returns a promise with all output from the command
function _executeAll(opts) {
  return new Promise((res, rej) => {
    let allData = []
    _execute(opts, d => {
      allData.push(d.error ? d.error : d.info)
      if (d.done) {
        const allInfo = allData.join('\n')
        d.error != null ? rej(allInfo) : res(allInfo)
      }
    })
  })
}

/**
 * run the axidraw cli with the given options and a callback to be informed of errors, successful connections, and other info
 * @param opts {AxiDrawCLI options} https://axidraw.com/doc/cli_api/#options
 * @param onData ({ error: string, info: string, connected: bool }) => void
 */
function _execute(opts, onData) {
  let args = _convertOptsToCmdArgs(opts)
  // available on the path since you have to pip install to install their cli--TODO: put into docker container with all dependencies
  axidrawCLIProcess = cli('axicli', args, data => {
    const isError = data.error != null || /Failed|No named AxiDraw units located|Input file required/i.test(data)
    if (isError) {
      errored = true
      onData({ error: data.error || data.info, done: data.done })
    }
    const isSuccess = true // TODO: make this more accurate when you play with the real machine...
    if (isSuccess) {
      onData({ info: data.info, connected: true, done: data.done })
    } else {
      onData({ info: data.info, done: data.done })
    }
  })
}

function _convertOptsToCmdArgs(opts) {
  if (opts == null) return []
  let cmdOpts = []
  if (opts.inputFile) {
    // input file is not a named option--you simply pass the name of the file as the first argument to axidraw cli
    cmdOpts.push(opts.inputFile)
    opts.inputFile = undefined
  }
  cmdOpts = cmdOpts.concat(Object.keys(opts)
    .filter(opt => opts[opt] != null)
    .map(opt => [`--${opt}`, `${opts[opt]}`])
    .reduce((a,b) => a.concat(b), []))
  return cmdOpts
}