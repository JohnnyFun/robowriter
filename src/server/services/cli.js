// wrapper for calling command line interfaces
const { spawn } = require('child_process')
module.exports = function(cli, args, onData) {
  let errored = false
  let cliProcess = spawn(cli, args)
  cliProcess.stdout.setEncoding('utf8')
  cliProcess.stderr.setEncoding('utf8')
  cliProcess.stdout.on('data', info => {
    console.error(info)
    onData({ info })
  })
  cliProcess.stderr.on('data', error => {
    errored = true
    console.error(error)
    onData({ error })
  })
  cliProcess.on('close', code => {
    const msg = `${cli} exited with code ${code}`
    const success = !errored && code === 0 // some of their commands write to stderr and effectively fail, but they set the code to success...
    const data = {
      info: success ? msg : null,
      error: success ? null : msg,
      done: true
    }
    success ? console.log(msg) : console.error(msg)
    onData(data)
  })
  return cliProcess
}