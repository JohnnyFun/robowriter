import { urls } from 'shared/constants'
import io from 'socket.io-client'
export default io(urls.server)