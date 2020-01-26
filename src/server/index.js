const cors = require('cors')
const { ports, urls } = require('../constants')
const prod = process.env.NODE_ENV === 'production'
const express = require('express')
const getUsbPorts = require('./services/usbports')
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
const onWebsocketConnection = require('./services/axidraw')

configureClient()
app.use('/assets', express.static('src/server/assets'))
app.get('/api/usbports', handleGetUsbPorts)
app.use(globalErrors)
io.on('connection', onWebsocketConnection)
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

// just show entire error client-side for now
function globalErrors(err, req, res, next) {
  console.error(err.stack)
  res.status(400).send(err.stack)
}

async function handleGetUsbPorts(req, res) {
  const ports = await getUsbPorts()
  res.json(ports)
}