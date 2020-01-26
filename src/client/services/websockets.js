import { urls } from '../../constants'
import io from 'socket.io-client'
import connected from 'stores/connected'

const socket = io(urls.server)
socket.on('cncserver', msg => {
  msg = JSON.parse(msg)
  if (msg.error) {
    console.error(msg.error)
    connected.set(false)
  }
  // if (msg.info) console.log(msg.info)
  if (msg.connected) connected.set(true)
})

export function startCncServer(serialPath) {
  socket.emit('cncserver', serialPath)
}