<script>
  import { slide } from 'svelte/transition'

  export let msg
  export let type = 'info'
</script>
{#if msg}
  <div transition:slide class="alert alert-{type}">
    {@html msg.replace('\n', '<br>')}
  </div>
{/if}