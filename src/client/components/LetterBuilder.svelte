<script>
	import GlobalErrors from 'components/GlobalErrors'
  // TODO: get variance stuff that hershey advanced apparently does:
  //       hershey's function is "to replace the text in your document with paths from the selected SVG font" https://cdn.evilmadscientist.com/dl/ad/public/HersheyText_v30r5.pdf 
  //       so this app's client-side functionality basically does what hershey does, just less setup
	import localstorage from 'services/local-storage'
	import Settings from 'components/Settings'
	import MenuBottom from 'components/MenuBottom'
	import Btn from 'components/Btn'
	import api from 'services/api'
  import { getPrintFont, getAlienBoy } from 'services/api'
  import SVGFont from 'services/svg-font'
  import websocket from 'services/websocket'
  import { toPixels, toInches } from 'services/screen'
  import { cleanseHTML } from 'services/utils'
  import { get,set } from 'services/local-storage'
  import errors from 'stores/global-errors'
  import { isEmpty } from 'shared/string-utils'

  const key = 'draft'
  let svgContainerEl
  let letter = get('draft') || ''
  let svgPaths = []
  let svgFont = null
  let printing = false
  let currentPrintPathIndex = -1 // TODO: depending on what axidraw cli shows as it's drawing, I might be able to re-implement this
  let lines = []
  let settings = {}

  init()

  $: set(key, letter)

  $: fontSize = settings.fontSize
  $: heightInches = settings.heightInches
  $: widthInches = settings.widthInches
  $: paddingXInches = settings.paddingXInches
  $: paddingYInches = settings.paddingYInches

  $: cleansedLetter = cleanseHTML(letter)
  $: svgPaths = svgFont ? svgFont.textToPaths(cleansedLetter, fontSize) : []

  $: height = toPixels(heightInches)
  $: width = toPixels(widthInches)
  $: paddingX = toPixels(paddingXInches)
  $: paddingY = toPixels(paddingYInches)

  async function init() {
    websocket.on('axidraw', msg => {
      msg = JSON.parse(msg)
      if (msg.error) {
        console.error(msg.error)
        errors.add(msg.error)
      }
      if (msg.info) console.log(msg.info)
      if (msg.connected) connected.set(true)
    })
    const svg = await getPrintFont()
    svgFont = new SVGFont(svg)
  }

  function abortJob() {
    websocket.emit('abort', opts)
  }

  async function printLetter() {
    if (isEmpty(letter)) {
      errors.add('Type a letter')
      return
    }
    websocket.emit('print', { 
      inputFile: svgContainerEl.innerHTML
    })
  }
</script>

<MenuBottom>
  {#if printing}
    <Btn icon="pause-circle" class="warning" on:click={abortJob}>Abort</Btn>
  {:else}
    <Btn icon="print" on:click={e => printLetter(0)}>Print</Btn>
  {/if}
</MenuBottom>
<Settings onChange={s => settings = s} />
<GlobalErrors />
{#if svgFont}
  <div class="paper-container">
    <div class="paper-contents" style="width: {width}px;">
      <h3>Editor</h3>
      <div 
        class="editor" 
        contenteditable="true" 
        bind:innerHTML={letter}
        style="width: {width}px; 
          height: {height}px; 
          max-height: {height}px; 
          padding: {paddingY-26}px {paddingX}px; 
          font-size: {fontSize}px; 
          font-family: {svgFont.font.id.replace('Print', '') + 'CAP'};
          line-height: {svgFont.calcLineHeight(fontSize)}px;"></div>
    
      <h3 class="preview-heading">Preview</h3>
      <div class="preview" bind:this={svgContainerEl}>
        <svg {width} {height} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate({paddingX}, {paddingY})">
            {#each svgPaths as p,i}
              <g transform="translate({p.horizAdvX}, {p.horizAdvY}) scale({svgFont.calcSize(fontSize)})">
                <path 
                  class:printing={currentPrintPathIndex === i} 
                  transform="rotate(180) scale(-1, 1)" d={p.d} /> <!-- svg glyphs' coordinate system has y-axis pointing downward transform="rotate(180) scale(-1, 1)" -->
              </g>
            {/each}
          </g>
        </svg>
      </div>
    </div>
  </div>
{/if}

<style>
  .paper-contents {
    margin: 10px auto;
  }
  .editor, .preview {
    color: #222;
    background-color: #fff;
    box-shadow: .4rem .4rem 1.1rem #888888;
    overflow: hidden;
    padding: 0;
  }
  .preview-heading {
    margin-top: 6rem;
  }
  path {
    fill: #000;
  }
  .printing {
    fill: red;
  }
  .paper-container {
    margin-top: 2rem;
    margin-bottom: 10rem;
  }
</style>