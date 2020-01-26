<script>
	import Icon from 'components/Icon'
	import Btn from 'components/Btn'
  import { isConnected } from 'services/api'
  import { ports } from '../../constants'

  let status = null
  let usingSimulator = true
  const checkConnectionStatus = async () => status = await isConnected()
  $: if (!usingSimulator) checkConnectionStatus()
  $: connected = usingSimulator ? true : status ? status.connected : false

  function toggleSimulator() {
    usingSimulator = !usingSimulator
    if (!usingSimulator) {
      /*  TODO
        - get list of available ports down to UI from server
          - each port will show
            - name [Button: Try to connect]
              - if no machine connected: 'Failed to connect to a machine through [port name]. [Button: Open Simulator] (when simulator ready)'
              - else 'Successfully connected to axidraw via [port name]!' and move the head out and back to show which one
        - Ideally, auto-select one that appears to be connected to a machine
          - and set that one as selected initially
      */
    }
  }
</script>

<div class="alert alert-{connected ? 'success' : 'danger'} status">
  {#if !usingSimulator}
    {#if !connected}Not{/if} Connected to axidraw machine via usb
  {:else}
    <a class="btn btn-secondary" href="http://localhost:{ports.simulator}" target="_blank">
      <Icon type="external-link" />
      Open simulator
    </a>
  {/if}
  <Btn class="secondary" on:click={toggleSimulator} icon="usb">
    Connect to {#if usingSimulator}axidraw machine{:else}simulator{/if}
  </Btn>
  {#if connected}
    <slot />  
  {/if}
</div>

<style>
  .status {
    position: fixed;
    display: inline-block;
    top:0;
    right: 0;
  }
</style>
