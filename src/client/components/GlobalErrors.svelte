<script>
  import Alert from 'components/Alert'
  import errors from 'stores/global-errors'
</script>

<div class="errors">
  {#if $errors}
    {#each $errors as e (e)}
      <Alert type="danger" msg={e} onClose={() => errors.del(e)} />
    {/each}
  {/if}
</div>

<style>
  .errors {
    position: fixed;
  }
</style>