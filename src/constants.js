const server = 5000
const client = 5002
const simulator = 5003
const buildUrl = port => `http://localhost:${port}`

module.exports = {
  ports: {
    server,
    client,
    simulator
  },
  urls: {
    server: buildUrl(server),
    client: buildUrl(client),
    simulator: buildUrl(simulator)
  },
  BOT_SCALE: {
    ratio: 12000 / 8720,
    factor: 14.2,
    offset: 20
  }
}