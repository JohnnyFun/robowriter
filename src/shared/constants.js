const server = 5005
const client = 5006
const buildUrl = port => `http://localhost:${port}`

module.exports = {
  ports: {
    server,
    client
  },
  urls: {
    server: buildUrl(server),
    client: buildUrl(client)
  },
  fonts: {
    QEMeganRikli: 'assets/latest/QEMeganRikli.svg',
    QEMeganRikliCAP: 'assets/latest/QEMeganRikliCAP.svg'
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