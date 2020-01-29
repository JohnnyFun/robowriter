import { urls } from '../../constants'
import error from 'stores/global-errors'

const getAsset = name => fetch(urls.server + `/assets/${name}`).then(r => r.text())


// TODO: probably use QEMeganRikliCAP.svg glyphs when it's multiple capital letters in a row, like with an acronym (and unit test that case)
//       and be sure printer does too when you swap to use engraving font at print time...but not sure

export const getPrintFont = () => getAsset('QEMeganRikliPrint.svg') // seems to map to QEMeganRikliCAP.svg, not QEMeganRikli.svg
// export const getPrintFont = () => getAsset('QEMeganRikli.svg')
// export const getPrintFont = () => getAsset('QEMeganRikliCAP.svg')
// export const getPrintFont = () => getAsset('hershey-text_svg_fonts_EMSAllure.svg')
export const getAlienBoy = () => getAsset('alien-boy.svg')

export const getAxiDrawMachines = () => fetch(urls.server + '/api/axidrawMachines').then(handleApiResponse)

async function handleApiResponse(res) {
  if (res.ok) return res.json()
  const err = await res.json()
  const errorMsg = err.error
  error.set(errorMsg)
  throw errorMsg
}