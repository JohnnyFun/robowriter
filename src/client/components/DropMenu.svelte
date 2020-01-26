<script>
	import Btn from 'components/Btn'
  import { onDestroy } from 'svelte'

  export let label
  export let btnIcon = null
  export let open = false

  const event = 'mousedown'
  let dropDownEl

  $: if (open) document.addEventListener(event, closeIfClickAway)
  else off()
  onDestroy(off)

  function off() {
    document.removeEventListener(event, closeIfClickAway)
  }
  
  function closeIfClickAway(e) {
    if (e.target.closest('.dropdown-menu') !== dropDownEl) {
      open = false
    }
  }
</script>

<div class="btn-group dropup">
  <Btn class="secondary dropdown-toggle" on:click={e => open = !open} icon={btnIcon}>
    {label}
  </Btn>
  {#if open}
    <div bind:this={dropDownEl} class="dropdown-menu show px-4">
      <slot />
    </div>
  {/if}
</div>