import { ports } from '../../constants'
const server = `http://localhost:${ports.server}/`

const getAsset = name => fetch(server + `assets/${name}`).then(r => r.text())
export const getSvgFont = () => Promise.all([
  getAsset('QEMeganRikliCAP.svg'), // TODO: might make more sense to show the ttf in the browser. But we have to generate svg paths anyway, so either way is probably fine as long as scale is correct
  getAsset('QEMeganRikliPrintSL.svg') 
]).then(([view, print]) => {
  return {
    view,
    print
  }
})
export const isConnected = () => fetch(server + 'api/connected').then(r => r.json())