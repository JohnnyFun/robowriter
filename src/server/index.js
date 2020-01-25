const prod = process.env.NODE_ENV === 'production'
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackConfig = require('../../webpack.config.js')

const express = require('express')
const app = express()
const port = 5000

if (prod) app.use(express.static('dist'))
else app.use(webpackDevMiddleware(webpack(webpackConfig)))

// send the svg paths to axidraw machine
app.post('/api/print', (req, res) => {
  res.send('TODO: implement')
})

app.get('/api/test', (req, res) => {
  console.log('yay')
  res.send('updated')
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))