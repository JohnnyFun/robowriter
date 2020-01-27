// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
export function hash(str) {
  var hash = 0, i, chr
  if (str.length === 0) return hash
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i)
    hash  = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

export function cleanseHTML(htmlStr) {
  htmlStr = htmlStr.replace(/<div><br><\/div>/g, '\n\n')
  htmlStr = htmlStr.replace(/<br>/g, '')
  htmlStr = htmlStr.replace(/&nbsp;/g, ' ')
  htmlStr = htmlStr.replace(/<(?:[^>]+)>/g, '')
  return htmlStr
}