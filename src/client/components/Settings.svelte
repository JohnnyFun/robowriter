<script>
	import Btn from 'components/Btn'
  import { get, set } from 'services/local-storage'

  export let onChange

  const key = 'settings'
  const defaultSettings = {
    fontSize: 35,
    heightInches: 11,
    widthInches: 8.5,
    paddingYInches: 1,
    paddingXInches: .8
  }

  let settings = {
    ...defaultSettings,
    ...get(key)
  }

  $: settings, settingsChanged()

  function settingsChanged() {
    set(key, settings)
    onChange(settings)
  }

  function resetDefault(e) {
    settings = { ...defaultSettings }
  }
</script>

<div class="settings form-inline">
  <div class="input-group mb-3 mr-4">
    <div class="input-group-append">
      <span class="input-group-text">Paper dimensions</span>
    </div>
    <input class="form-control" type="number" bind:value={settings.widthInches} min={0} step=".5" /> 
    <div class="input-group-append">
      <span class="input-group-text">Inches</span>
    </div>
    <div class="input-group-append">
      <span class="input-group-text">x</span>
    </div>
    <input class="form-control" type="number" bind:value={settings.heightInches} min={0} step=".5" /> 
    <div class="input-group-append">
      <span class="input-group-text">Inches</span>
    </div>
  </div>

  <div class="input-group mb-3 mr-4">
    <div class="input-group-append">
      <span class="input-group-text">Margin side</span>
    </div>
    <input class="form-control" type="number" bind:value={settings.paddingXInches} step=".1" min={0} /> 
    <div class="input-group-append">
      <span class="input-group-text">Inches</span>
    </div>
    <div class="input-group-append">
      <span class="input-group-text">Margin top</span>
    </div>
    <input class="form-control" type="number" bind:value={settings.paddingYInches} step=".1" min={0} /> 
    <div class="input-group-append">
      <span class="input-group-text">Inches</span>
    </div>
  </div>

  <div class="input-group mb-3">
    <div class="input-group-append">
      <span class="input-group-text">Font size</span>
    </div>
    <input class="form-control" type="number" bind:value={settings.fontSize} min={0} />
    <div class="input-group-append">
      <span class="input-group-text">Pixels</span>
    </div>
  </div>
  <div class="input-group mb-3 ml-3">
    <Btn icon="refresh" on:click={resetDefault}>Reset default</Btn>
  </div>
</div>

<style>
  .settings {
    min-width: 43rem;
  }
  input[type="number"] {
    width: 8rem;
  }
</style>