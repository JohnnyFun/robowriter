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
  axidrawCLI: 
    // default is good. probably don't use 1 or 3 (see below for details)
    PORTCODES = {
      FirstUnitFound: 0, // default--use first axidraw located via usb. or, if --port is specified, attempt to only communicate with an axidraw machine connected via the specified port
      FirstAxiDrawFound: 1, // similar to 0, but ignores if --port is specified
      AllAxiDraw: 3 // see https://axidraw.com/doc/cli_api/#multiple-axidraw-units--probably favor starting multiple instances of axidraw cli to get consistent output
    },
    MODELCODES: {
      V2Or3: 1,
      V3A3: 2,
      V3XLX: 3 
    }
}