<script>
  import { slide } from 'svelte/transition'

  export let msg
  export let type = 'info'
  export let onClose = null
</script>
{#if msg}
  <div transition:slide class="alert alert-{type} alert-dismissible">
    <button type="button" class="close" aria-label="Close" on:click={onClose}>
      <span aria-hidden="true">&times;</span>
    </button>
    {@html msg.replace('\n', '<br>')}
  </div>
{/if}