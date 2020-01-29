/* 
wrapper for the axidraw cli (same software inkscape uses to connect to axidraw--so you can programmatically call it without needing inkscape)
docs: https://axidraw.com/doc/py_api/"
see also: https://evilmadscience.s3.us-east-1.amazonaws.com/dl/ad/private/AxiDraw_Merge_v25_G.pdf
*/
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

module.exports.print = function print(svgText, onData) {
  const inputFile = path.resolve(__dirname, `temp/${new Date().getTime()}.svg`)
  const handleErr = err => onData({ error: err.stack })
  fs.writeFile(inputFile, svgText, 'utf8', err => {
    if (err) {
      handleErr(err)
      return
    }
    const removeTempFile = () => {
      fs.unlink(inputFile, err => {
        if (err) handleErr(err)
      })
    }
    _execute({
      inputFile
    }, d => {
      if (d.done) removeTempFile()
      onData(d)
    })
  })
}

module.exports.getUsbPorts = function getUsbPorts() {
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

// same as _execute but returns a promise with all output from the command
function _executeAll(opts) {
  return new Promise((res, rej) => {
    let allData = []
    _execute(opts, d => {
      allData.push(d.error ? `ERROR: ${d.error}` : `INFO: ${d.info}`)
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
    let axidrawCLIProcess = null
    let cli = 'axicli' // available on the path since you have to pip install to install their cli--no big deal when move this to docker container...
    let args = _convertOptsToCmdArgs(opts)
    let errored = false
    axidrawCLIProcess = spawn(cli, args)
    axidrawCLIProcess.stdout.setEncoding('utf8')
    axidrawCLIProcess.stderr.setEncoding('utf8')
    axidrawCLIProcess.stdout.on('data', data => {
      const isError = /Failed|No named AxiDraw units located|Input file required/i.test(data)
      if (isError) {
        console.error(data)
        onData({ error: data })
      }
      const isSuccess = true // TODO: make this more accurate when you play with the real machine...
      if (isSuccess) {
        console.log(data)
        onData({ info: data, connected: true })
      } else { 
        console.log(data)
        onData({ info: data })
      }
    })
    axidrawCLIProcess.stderr.on('data', data => {
      errored = true
      console.error(data)
      onData({ error: data })
    })
    axidrawCLIProcess.on('close', code => {
      const msg = `AxiDrawCLI exited with code ${code}`
      const success = !errored && code === 0 // some of their commands write to stderr and effectively fail, but they set the code to success...
      const data = {
        info: success ? msg : null,
        error: success ? null : msg,
        done: true
      }
      success ? console.log(msg) : console.error(msg)
      onData(data)
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
  cmdOpts = cmdOpts.concat(Object.keys(opts).map(opt => [`--${opt}`, `${opts[opt]}`]).reduce((a,b) => a.concat(b), []))
  return cmdOpts
}