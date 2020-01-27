<script>
  import { get, set } from 'services/local-storage'

  export let onChange

  const key = 'settings'
  let settings = {
    fontSize: 35,
    heightInches: 11,
    widthInches: 8.5,
    paddingYInches: 1,
    paddingXInches: .8,
    ...get(key)
  }

  $: settings, settingsChanged()

  function settingsChanged() {
    set(key, settings)
    onChange(settings)
  }
</script>

<div class="settings form-inline">
  <div class="input-group mb-3 mr-4">
    <div class="input-group-append">
      <span class="input-group-text">Paper dimensions</span>
    </div>
    <input class="form-control" type="number" bind:value={settings.widthInches} /> 
    <div class="input-group-append">
      <span class="input-group-text">Inches</span>
    </div>
    <div class="input-group-append">
      <span class="input-group-text">x</span>
    </div>
    <input class="form-control" type="number" bind:value={settings.heightInches} /> 
    <div class="input-group-append">
      <span class="input-group-text">Inches</span>
    </div>
  </div>

  <div class="input-group mb-3">
    <div class="input-group-append">
      <span class="input-group-text">Font size</span>
    </div>
    <input class="form-control" type="number" bind:value={settings.fontSize} />
    <div class="input-group-append">
      <span class="input-group-text">Pixels</span>
    </div>
  </div>
</div>

<style>
  .settings {
    min-width: 43rem;
  }
</style>