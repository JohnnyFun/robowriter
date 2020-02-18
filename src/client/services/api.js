import { urls } from 'shared/constants'
import errors from 'stores/global-errors'

const getAsset = name => fetch(urls.server + `/assets/latest/${name}`).then(r => r.text())

export const getPrintFont = () => getAsset('QEMeganRikliCAP.svg') 
export const getAxiDrawMachines = () => fetch(urls.server + '/api/axidrawMachines').then(handleApiResponse)

async function handleApiResponse(res) {
  if (res.ok) return res.json()
  const err = await res.json()
  const errorMsg = err.error
  errors.add(errorMsg)
  throw errorMsg
}