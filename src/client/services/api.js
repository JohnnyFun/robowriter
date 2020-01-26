import { urls } from '../../constants'

const getAsset = name => fetch(urls.server + `/assets/${name}`).then(r => r.text())
export const getSvgFont = () => Promise.all([
  getAsset('QEMeganRikliCAP.svg'), // TODO: might make more sense to show the ttf in the browser. But we have to generate svg paths anyway, so either way is probably fine as long as scale is correct
  getAsset('QEMeganRikliPrintSL.svg') 
]).then(([view, print]) => {
  return {
    view,
    print
  }
})

export const getPrintFont = () => getAsset('QEMeganRikliPrintSL.svg')
export const getUsbPorts = () => fetch(urls.server + '/api/usbports').then(r => r.json())