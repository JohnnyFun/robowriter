const server = 'http://localhost:5000/' // TODO: DRY--generate into html file with webpack or something

export const getSvgFont = () => fetch(server + 'assets/QEMeganRikliCAP.svg').then(r => r.text())
export const isConnected = () => fetch(server + 'api/connected').then(r => r.json())
export async function print(svgPaths) {
  const res = await fetch(server + 'api/print', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ svgPaths })
  })
  const success = res.status >= 200 && res.status <= 399
  const resText = await res.text()
  if (!success) throw new Error(resText)
  return await res.json()
}
