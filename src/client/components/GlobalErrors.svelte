<script>
  import Alert from 'components/Alert'
  import errors from 'stores/global-errors'
</script>

{#if $errors}
  {#each $errors as e (e)}
    <Alert type="danger" msg={e} onClose={() => errors.del(e)} />
  {/each}
{/if}