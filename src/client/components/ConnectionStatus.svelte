<script>
  import { isConnected } from 'services/api'
  let status = null
  let usingSimulator = true
  $: connected = usingSimulator ? true : status ? status.connected : false
  const checkConnectionStatus = async () => status = await isConnected()

  $: if (!usingSimulator) checkConnectionStatus()

  function toggleSimulator() {
    usingSimulator = !usingSimulator
    if (!usingSimulator) {
      // TODO: call to server to try to connect to axidraw
    }
  }
</script>

<div class="status" class:connected>
  {#if !usingSimulator}
    {#if !connected}Not{/if} Connected to axidraw machine via usb
  {:else}
    <a class="open-simulator" href="http://localhost:4000" target="_blank">Open simulator</a>
  {/if}
  <button on:click={toggleSimulator}>
    Use {#if usingSimulator}axidraw machine{:else}simulator{/if}
  </button>
</div>

<style>
  .status {
    position: fixed;
    display: inline-block;
    top:0;
    right: 0;
    padding: .5rem;
    background-color: red;
    color: #eee;
    border-radius: 0 0 0 .5rem;
  }

  .open-simulator {
    color: #eee;
    margin-bottom: 5px;
    display: block;
  }

  .connected {
    background-color: green;
  }
</style>
