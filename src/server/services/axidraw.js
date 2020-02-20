/* 
wrapper for the axidraw cli (same software inkscape uses to connect to axidraw--so you can programmatically call it without needing inkscape)
docs: https://axidraw.com/doc/py_api/"
see also: https://evilmadscience.s3.us-east-1.amazonaws.com/dl/ad/private/AxiDraw_Merge_v25_G.pdf
*/
const cli = require('./cli')
const { createTempFile, readTempFile, delTempFile, resolveTempFileName } = require('./tempfiles')
const { isEmpty } = require('../../shared/string-utils')
let axidrawCLIPrintProcesses = {} // could start multiple print jobs with multiple machines

module.exports.abort = function abort(jobId, onData) {
  const jobs = Object.keys(axidrawCLIPrintProcesses)
  console.log(`Aborting ${jobId ? jobId : `all print jobs (${jobs.length})`}`)
  function killJob(jobId) {
    if (axidrawCLIPrintProcess[jobId]) {
      axidrawCLIPrintProcesses[jobId].kill()
      axidrawCLIPrintProcesses[jobId] = null
      console.log(`Killed job ${jobId}`)
    }
  }
  if (jobId == null) jobs.forEach(killJob)
  else killJob(jobId)
  onData({ aborted: true, jobId })
}

module.exports.getAxiDrawMachines = function getAxiDrawMachines() {
  // `axicli --mode manual --manual_cmd list_names`
  const args = [
    '--mode', 'manual',
    '--manual_cmd', 'list_names'
  ]
  return _executeAll(args).then(d => {
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

module.exports.printPreview = function printPreview(opts, onData) {
  // `axicli input.svg -vg3 -o output.svg`, where input.svg is hersheyified
  const handleErr = err => {
    console.error(err)
    onData({ error: err.stack })
  }
  if (isEmpty(opts.inputFile)) return handleErr(new Error('opts.inputFile is required'))
  const inputFile = resolveTempFileName(`${new Date().getTime()}-printing-preview-in.svg`)
  const outputFile = resolveTempFileName(`${new Date().getTime()}-printing-preview-out.svg`)
  createTempFile(inputFile, opts.inputFile)
    .then(() => {
      const args = [
        inputFile,
        '-vg3',
        '-o', 
        outputFile
      ]
      _execute(args, d => {
        if (d.done) {
          delTempFile(inputFile).catch(handleErr)
          readTempFile(outputFile)
            .then(axidrawPreview => {
              axidrawPreview = axidrawPreview.replace(/svg\:g/g, 'g') // not sure why axidraw cli outputs svg:g elements. they don't render, so fix just use normal "g" elements
              onData({ axidrawPreview })
              delTempFile(outputFile).catch(handleErr)
            })
            .catch(handleErr)
        }
        onData(d)
      })
    })
    .catch(handleErr)
}

module.exports.print = function print(opts, onData) {
  // `axicli input.svg`, where input.svg is hersheyified
  const handleErr = (err) => {
    console.error(err)
    onData({ error: err.stack })
  }
  // TODO: handle multiple machines--errors, info, and done should be tied to a machine id. UI should not allow printing to a machine that's printing--have to abort first
  // if (isEmpty(opts.machine)) return handleErr(new Error('opts.machine is required')) 
  if (isEmpty(opts.inputFile)) return handleErr(new Error('opts.inputFile is required'))
  const inputFile = resolveTempFileName(`${new Date().getTime()}-printing.svg`)
  createTempFile(inputFile, opts.inputFile)
  .then(() => {
      const args = [
        '--const_speed', // 'True', // important for smoothness?
        '--pen_pos_up', '10',
        '--pen_pos_down', '-2',
        inputFile
      ]
      onData({ jobId: inputFile })
      axidrawCLIPrintProcesses[inputFile] = _execute(args, d => {
        onData(d)
        if (d.done) delTempFile(inputFile).catch(handleErr)
      })
    })
    .catch(handleErr)
}

// same as _execute but returns a promise with all output from the command
function _executeAll(args) {
  return new Promise((res, rej) => {
    let allData = []
    _execute(args, d => {
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
function _execute(args, onData) {
  // available on the path, since we ran `pip install .` to install their cli
  return cli('axicli', args, data => {
    const isError = data.error != null || /Failed|No named AxiDraw units located|Input file required/i.test(data)
    if (isError) {
      errored = true
      onData({ error: data.error || data.info, done: data.done })
      return
    }
    const isSuccess = true // TODO: make this more accurate when you play with the real machine...
    if (isSuccess) {
      onData({ info: data.info, connected: true, done: data.done })
    } else {
      onData({ info: data.info, done: data.done })
    }
  })
}