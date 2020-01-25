const prod = process.env.NODE_ENV === 'production';
const port = 5000
const express = require('express')
var cors = require('cors')
const app = express()

if (!prod) {
  // during dev, fire up webpack-dev-server on port 8080
  app.use(cors({
    origin: 'http://localhost:8080' // TODO: DRY port
  }))
}

// when built for production, the server and client will be served on same port
app.use(express.static('dist'))

// send the svg paths to axidraw machine
app.post('/api/print', (req, res) => {
  res.send('TODO: implement')
})

app.get('/api/test', (req, res) => {
  res.send('updated##')
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))