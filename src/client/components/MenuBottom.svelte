<script>
	import DropMenu from 'components/DropMenu'
	import { get,set } from 'services/local-storage'
	import Loading from 'components/Loading'
	import Icon from 'components/Icon'
	import Btn from 'components/Btn'
  import { urls } from 'shared/constants'
  import { dpi } from 'services/screen'
  import { print } from 'services/websocket'
  import { getAxiDrawMachines } from 'services/api'
  
  
  const key = 'printTo'

  let status = null
  let axiDrawMachines = null
  let printTo = get(key)
  $: set(key, printTo)
  
  getAxiDrawMachines()
    .then(r => axiDrawMachines = r) 
    .catch(err => axiDrawMachines = [])

  function connectTo(axiDrawMachine) {
    printTo = axiDrawMachine
  }
</script>

<div class="menu">
  <div class="menu-text">DPI: {dpi}</div>
  <div class="actions">
    <!-- holding off on multi-machine support since it might actually just make sense to have an instance of the app running at each machine instead of having to choose which machine to print to
      <DropMenu btnIcon="usb" label="Change connection">
      {#if axiDrawMachines == null}
        <Loading />
      {:else}
        {#each axiDrawMachines as p,i}
          <div class="item">
            <p>
              {#if p.manufacturer}{p.manufacturer} - {/if}
              {p.name} 
            </p>
            <div>
              <Btn class="sm {printTo === p.value ? 'btn-primary' : 'btn-secondary'}" on:click={e => connectTo(p.value)}>
                {#if printTo === p.value}
                  Re-Connect
                {:else}
                  Connect
                {/if}
              </Btn>
            </div>
          </div>
          {#if i < axiDrawMachines.length-1}<div class="dropdown-divider"></div>{/if}
        {/each}
      {/if}
    </DropMenu>   -->
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

  /* .item {
    font-size: 1.3rem;
    padding: 1rem;
  } */
</style>
