// TODO: probably won't use this...instead using axidraw cli that takes an svg rather than just xy coords
const { ports } = require('../../constants')
const { spawn } = require('child_process')
let serverProcess = null

module.exports = function onWebsocketConnection(socket) {
  socket.on('cncserver', serialPath => restartServer(serialPath))
  function send(msgObj) {
    socket.emit('cncserver', JSON.stringify(msgObj))
  }

  function restartServer(serialPath = '{auto}') {
    // using command line since his node module seems brittle...
    // https://github.com/techninja/cncserver/blob/master/cncserver.js
    // NOTE: you'll want to clone my fork of cnc server at https://github.com/JohnnyFun/cncserver/tree/update-serialport 
    //       since he still hasn't merged my pull request to update serial and fix simulator init issue
    //       when you clone, be sure you're on branch "update-serialport"
    //       once cloned, point this cmd to the cncserver.js file accordingly
    
    /*
      TODO
      given that cnc server doesn't seem to be maintained, consider using the axidraw cli, written in python
      theoretically you'd be able to just call that in place of this, pretty much...
      consider setting up POST /print endpoint that saves svg as file and then passes it to the axidraw cli
      BUT you'll need real machine though to test, which sucks...ideally, we'd get the simulator working.
      Also realize that you might just not be doing something that hershey is doing. But seems like the svg-linearize function might just not be that great
      TODO: try better quality settings for svg-linearize..."k" char was weird, but "O" looked good, for instance
    */
    if (serverProcess != null) serverProcess.kill()
    serverProcess = spawn('node', [
      '../cncserver/cncserver.js', 
      '--botType=axidraw',
      `--httpPort=${ports.simulator}`,
      `--serialPath=${serialPath}`
    ])
    serverProcess.stdout.setEncoding('utf8')
    serverProcess.stderr.setEncoding('utf8')
    serverProcess.stdout.on('data', data => {
      const isSuccess = /connected to cncserver!/i.test(data)
      if (isSuccess) {
        console.log(data)
        // TODO: should further investigate the connection...mine says I'm connected, but I am not connected to an axidraw machine
        // also, my desktop shows only single port, but it has many, so usbports might not actually be getting all usbports like I assumed
        send({ connected: true })
      }
      const isError = /error|failed/i.test(data)
      if (isError) {
        console.error(data)
        send({ error: data })
      } else { 
        // console.log(data)
        // send({ info: data })
      }
    })
    serverProcess.on('close', code => send({ error: `CNC server exited with code ${code}` }))
  }
} 