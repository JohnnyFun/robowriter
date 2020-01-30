// clever way to get dpi (dots per inch) in client-side js
// https://stackoverflow.com/questions/476815/how-to-access-screen-display-s-dpi-settings-via-javascript
// make an element off the screen off screen that is 1in x 1in and check its offsetHeight
const dpiEl = document.createElement('div')
dpiEl.style = 'height: 1in; width: 1in; left: -100%; position: absolute; top: -100%;'
document.body.appendChild(dpiEl)
export const dpi = dpiEl.offsetHeight
document.body.removeChild(dpiEl)

export const inchesToPixels = val => val ? val * dpi : 0
export const pixelsToInches = val => val ? val / dpi : 0
export const inchesToMM = val => val ? val * 25.4 : 0
export const pixelsToMM = val => val ? inchesToMM(pixelsToInches(val)) : 0