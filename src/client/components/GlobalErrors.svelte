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
    overflow: scroll;
    max-height: 300px; /*some cli output seems to pring an empty chunk of svg...so error messages can get pretty long*/
  }
</style>