<script>
	import api from 'services/api'
  import { getSvgFont, print } from 'services/api'
  import SVGFont from 'services/svgFont'

  let fontSize = 35
  let letter = `
Hi there!

  I made you a package! It has treats for you to put in your mouth, taste, and swallow.
Don't eat too many treats though.

Here's another paragraph. Each character is an SVG path, so the axidraw machine will 
be able to consume it and regurgitate it onto paper.

Still some work to do to make sure spacing, line height, etc look decent, but this should
do the trick!

Sincerely,

- John
    `

  let svgPaths = ''
  let svgFont = null
  let loading = false
  let error = null

  init()

  $: if (svgFont !== null) {
    const output = svgFont.textToPaths(letter, fontSize)
    svgPaths =  `<g transform="translate(10, 40)">${output}</g>`
  }

  async function init() {
    const svgString = await getSvgFont()
    svgFont = new SVGFont(svgString)
  }

  function printLetter() {
    loading = true
    error = null
    print()
      .then(r => console.log(r))
      .catch(err => error = err)
      .finally(() => loading = false)
  }
</script>

<label>Font Size</label><br>
<input type="number" bind:value={fontSize} />
<br><br>
<label>Your letter</label><br>
<textarea bind:value={letter}></textarea>
<br><br>
<label>Preview</label>
<br>
<svg width="1000" height="700" xmlns="http://www.w3.org/2000/svg">
  {@html svgPaths}
</svg>
<br>
<button type="button" on:click={printLetter} disabled={loading}>Print</button>
{#if error}<div class="error">{@html error.replace('\n', '<br>')}</div>{/if}

<style>
    svg {
      background-color: #eee;
    }
    :global(path) { /*not really global--consider using svelte to build out the svgpaths instead*/
      stroke: #000;
      stroke-width: 1.5;
      fill: #000;
    }
    textarea {
      width: 50rem;
      height: 5rem;
    }
    label {
      font-weight: bold;
    }

    .error {
      margin: 1rem;
      padding: 1rem;
      border-radius: 1rem;
      background-color: red;
      color: #eee;
    }
  </style>