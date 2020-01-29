import { urls } from '../../constants'
import io from 'socket.io-client'
export default io(urls.server)