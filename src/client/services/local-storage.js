export const get = key => localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null
export const set = (key, val) => localStorage.setItem(key, val ? JSON.stringify(val) : null)