<script>
	import DropMenu from 'components/DropMenu'
	import { get,set } from 'services/local-storage'
	import Loading from 'components/Loading'
	import Icon from 'components/Icon'
	import Btn from 'components/Btn'
  import { urls } from '../../constants'
  import { dpi } from 'services/screen'
  import { print } from 'services/websocket'
  import { getUsbPorts } from 'services/api'
  
  // note if you want to connect multiple machines and print to all of them, you'd just need to fire up multiple instances of cncserver and hit all their apis the same as you draw
  // else you could set up PIs hooked to each of them, each of which could pull from a central db of jobs
  // for now, just keep it simple though...single machine, connected to single computer
  const key = 'connectedTo'

  let status = null
  let usbPorts = null
  let connectedTo = get(key)
  $: set(key, connectedTo)
  
  // connectTo(connectedTo)
  getUsbPorts()
    .then(r => usbPorts = r) 
    .catch(err => usbPorts = [])

  function connectTo(usbPort) {
    connectedTo = usbPort
  }
</script>

<div class="menu">
  <div class="menu-text">DPI: {dpi}</div>
  <div class="actions">
    <DropMenu btnIcon="usb" label="Change connection">
      {#if usbPorts == null}
        <Loading />
      {:else}
        {#each usbPorts as p,i}
          <div class="item">
            <p>
              {#if p.manufacturer}{p.manufacturer} - {/if}
              {p.name} 
            </p>
            <div>
              <Btn class="sm {connectedTo === p.value ? 'btn-primary' : 'btn-secondary'}" on:click={e => connectTo(p.value)}>
                {#if connectedTo === p.value}
                  Re-Connect
                {:else}
                  Connect
                {/if}
              </Btn>
            </div>
          </div>
          {#if i < usbPorts.length-1}<div class="dropdown-divider"></div>{/if}
        {/each}
      {/if}
    </DropMenu>  
    <slot />
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

  :global(.menu-text) {
    font-size: 1.2rem;
    position: relative;
    top: 1rem;
  }

  .item {
    font-size: 1.3rem;
    padding: 1rem;
  }
</style>
