const SerialPort = require('serialport')

module.exports = async function getUsbPorts() {
  return SerialPort.list().then(ports => {
    const simulator = { 
      name: 'Simulator', 
      value: null 
    }
    return [
      ...ports.map(p => ({
        name: p.path,
        manufacturer: p.manufacturer,
        value: p.path
        // TODO: ideally indicate if this port looks to have a machine attached to it, so we can auto connect accordingly
      })), 
      simulator
    ]
  }, error => {
    throw new Error(error)
  })
}