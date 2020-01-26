<script>
	import LetterBuilder from 'components/LetterBuilder'
</script>

<LetterBuilder />

<style>
  :global(html) {
    font-size: 10px; /*so that 1rem === 10px*/
  }

  :global(body) {
    font-family: Arial, Helvetica, sans-serif;
    padding: 2rem;
    font-size: 1.5rem;
    background-color: #eee;
    color: #666;
  }

  /*TODO: use their sass files instead--import only what you use, set their font-size sass var...*/
  :global(.btn, .form-control) {
    font-size: 1.5rem;
  }

  /*scrollbar styling*/
  /* width */
  :global(::-webkit-scrollbar) {
    width: 10px;
    height: 10px;
    border-radius: 5px;
  }

  /* Track */
  :global(::-webkit-scrollbar-track) {
    background: #f1f1f1;
    border-radius: 5px;
  }

  /* Handle */
  :global(::-webkit-scrollbar-thumb) {
    background: #c9c9c9;
    border-radius: 5px;
  }

  /* Handle on hover */
  :global(::-webkit-scrollbar-thumb:hover) {
    background: darken(#c9c9c9, 10%);
  }
</style>