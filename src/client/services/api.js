import { urls } from 'shared/constants'
import errors from 'stores/global-errors'

const getAsset = name => fetch(urls.server + `/assets/latest/${name}`).then(r => r.text())


// TODO: probably use QEMeganRikliCAP.svg glyphs when it's multiple capital letters in a row, like with an acronym (and unit test that case)
//       and be sure printer does too when you swap to use engraving font at print time...but not sure
//       but we only have one print svg font...missing one for the smoother/non-CAP font?

export const getPrintFont = () => getAsset('QEMeganRikli.svg') 
export const getAxiDrawMachines = () => fetch(urls.server + '/api/axidrawMachines').then(handleApiResponse)

async function handleApiResponse(res) {
  if (res.ok) return res.json()
  const err = await res.json()
  const errorMsg = err.error
  errors.add(errorMsg)
  throw errorMsg
}