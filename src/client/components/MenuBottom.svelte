<script>
	import Icon from 'components/Icon'
	import Btn from 'components/Btn'
  import { isConnected } from 'services/api'
  import { ports } from '../../constants'
  import { dpi } from 'services/screen'

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

<div class="menu">
  <div class="dpi">DPI {dpi}</div>
  <div class="actions">
    {#if !usingSimulator}
      <span class="text-danger">
        {#if !connected}Not{/if} Connected to axidraw machine via usb
      </span>
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
</div>

<style>
  .menu {
    position: fixed;
    display: flex;
    justify-content: space-between;
    bottom:0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background-color: #222;
    opacity: .85;
    padding: 1.3rem 2rem;
    color: #ddd;
  }

  .actions {
    justify-content: flex-end;
  }

  .dpi {
    font-size: 1.2rem;
    position: relative;
    top: 1.5rem;
  }
</style>
