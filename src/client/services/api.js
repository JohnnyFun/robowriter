const server = 'http://localhost:5000/' // TODO: DRY--generate into html file with webpack or something

export async function print() {
  const res = await fetch(server + 'api/test').then(r => r.text())
  return res
}