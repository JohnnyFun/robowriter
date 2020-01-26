// clever way to get dpi (dots per inch) in client-side js
// https://stackoverflow.com/questions/476815/how-to-access-screen-display-s-dpi-settings-via-javascript
// make an element off the screen off screen that is 1in x 1in and check its offsetHeight
const dpiEl = document.createElement('div')
dpiEl.style = 'height: 1in; width: 1in; left: -100%; position: absolute; top: -100%;'
document.body.appendChild(dpiEl)
export const dpi = dpiEl.offsetHeight
document.body.removeChild(dpiEl)

export const toPixels = (val, unit = 'in') => val * dpi
export const toInches = (val, unit = 'px') => val / dpi