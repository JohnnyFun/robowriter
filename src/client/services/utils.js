export function cleanseHTML(htmlStr) {
  htmlStr = htmlStr.replace(/<div>([^<]+)<\/div>/g, '<br>$1<br>')
  htmlStr = htmlStr.replace(/<div><br><\/div>/g, '\n\n')
  htmlStr = htmlStr.replace(/<br>/g, '\n')
  htmlStr = htmlStr.replace(/&nbsp;/g, ' ')
  htmlStr = htmlStr.replace(/<(?:[^>]+)>/g, '')
  return htmlStr
}