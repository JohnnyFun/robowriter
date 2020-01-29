import { writable } from 'svelte/store'

function createStore() {
  const { subscribe, set, update } = writable([])
  return {
    subscribe,
    add: err => update(e => e.concat(err)),
    del: err => update(e => e.filter(x => x !== err))
  }
}

export default createStore()