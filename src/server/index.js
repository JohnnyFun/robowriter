const cors = require('cors')
const { ports, urls } = require('../shared/constants')
const prod = process.env.NODE_ENV === 'production'
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  handlePreflightRequest: prod ? undefined : (req, res) => {
      const headers = {
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Origin": urls.client,
          "Access-Control-Allow-Credentials": true
      };
      res.writeHead(200, headers);
      res.end();
  }
})
const { getAxiDrawMachines, print, abort } = require('./services/axidraw')
const { convertTextToPaths } = require('./services/hershey-advanced')

configureClient()
app.use('/assets', express.static('src/server/assets'))
app.get('/api/axidrawMachines', handled(handleGetAxiDrawMachines))
io.on('connection', onNewSocketConnection)
app.use(globalErrors)
http.listen(ports.server, () => console.log(`Example app listening at ${urls.server}`))


// during dev, webpack-dev-server runs on a different port
// when built for production, the server and client are served on same port
function configureClient() {
  if (!prod) {
    app.use(cors({
      origin: urls.client
    }));
  }
  else {
    app.use(express.static('dist'));
  }
}

// just show entire error client-side for now and set status to 400 so browsers show full stack too
function globalErrors(err, req, res, next) {
  if (res.headersSent) return next(err)
  return res.status(err.status || 400).json({ error: err.stack || err.message || err }) 
}

// so unhandled promise rejection get to the global error handler
function handled(asyncFunc) {
  return async (req, res, next) => asyncFunc(req, res, next).catch(next)
}

async function handleGetAxiDrawMachines(req, res) {
  const ports = await getAxiDrawMachines()
  res.json(ports)
}

function onNewSocketConnection(socket) {
  socket.on('preview', opts => convertTextToPaths(opts, msgObj => socket.emit('print', JSON.stringify(msgObj))))
  socket.on('print', opts => print(opts, msgObj => socket.emit('print', JSON.stringify(msgObj))))
  socket.on('abort', (jobId = null) => abort(jobId, msgObj => socket.emit('print', JSON.stringify(msgObj))))
}