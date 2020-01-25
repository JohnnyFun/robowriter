<script>
	import LetterBuilder from 'components/LetterBuilder'
  import ConnectionStatus from 'components/ConnectionStatus'
</script>

<ConnectionStatus />
<LetterBuilder />

<style>
  :global(html) {
    font-size: 10px; /*so that 1rem === 10px*/
  }

  :global(body) {
    font-family: Arial, Helvetica, sans-serif;
    padding: 1rem;
    font-size: 1.3rem;
  }
</style>