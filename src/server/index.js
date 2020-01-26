const express = require('express')
const cors = require('cors')
const { ports } = require('../constants')
const prod = process.env.NODE_ENV === 'production'
const app = express()

configureClient()
app.use('/assets', express.static('src/server/assets'))
app.get('/api/connected', connected)
app.use(globalErrors)
app.listen(ports.server, () => console.log(`Example app listening at http://localhost:${ports.server}`))


// during dev, webpack-dev-server runs on a different port
// when built for production, the server and client are served on same port
function configureClient() {
  if (!prod) {
    app.use(cors({
      origin: `http://localhost:${ports.client}`
    }));
  }
  else {
    app.use(express.static('dist'));
  }
}

// checks if the axidraw machine is connected via USB
function connected(req, res) {
  res.send({
    connected: false
  })
}

// just show entire error client-side for now
function globalErrors(err, req, res, next) {
  console.error(err.stack)
  res.status(400).send(err.stack)
}
