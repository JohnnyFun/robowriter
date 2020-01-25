const prod = process.env.NODE_ENV === 'production';
const port = 5000
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')

configureClient();
app.use('/assets', express.static('src/server/assets'))
// all api requests should have json bodies
app.use(bodyParser.json()) 
app.get('/api/connected', connected)
app.post('/api/print', print)
app.use(globalErrors)
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))


// during dev, webpack-dev-server runs on port 8080 live-reloading client-side
// when built for production, the server and client will be served on same port
function configureClient() {
  if (!prod) {
    app.use(cors({
      origin: 'http://localhost:8080' // TODO: DRY port
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

// send the svg paths to axidraw machine
function print(req, res) {
  const svgPaths = req.body.svgPaths;
  if (svgPaths == null || svgPaths.trim() === '')
    throw new Error('No svg data was provided');
}

// just show entire error client-side for now
function globalErrors(err, req, res, next) {
  console.error(err.stack)
  res.status(400).send(err.stack)
}
