import { urls } from '../../constants'

const getAsset = name => fetch(urls.server + `/assets/${name}`).then(r => r.text())


// export const getSvgFont = () => Promise.all([
//   getAsset('QEMeganRikliCAP.svg'), // TODO: might make more sense to show the ttf in the browser. But we have to generate svg paths anyway, so either way is probably fine as long as scale is correct
//   getAsset('QEMeganRikliPrintSL.svg') 
// ]).then(([view, print]) => {
//   return {
//     view,
//     print
//   }
// })

// TODO: probably use QEMeganRikliCAP.svg glyphs when it's multiple capital letters in a row, like with an acronym (and unit test that case)
//       and be sure printer does too when you swap to use engraving font at print time...but not sure

// export const getPrintFont = () => getAsset('QEMeganRikliPrint.svg')
export const getPrintFont = () => getAsset('QEMeganRikli.svg')
// export const getPrintFont = () => getAsset('QEMeganRikliCAP.svg')
// export const getPrintFont = () => getAsset('hershey-text_svg_fonts_EMSAllure.svg')
export const getUsbPorts = () => fetch(urls.server + '/api/usbports').then(r => r.json())