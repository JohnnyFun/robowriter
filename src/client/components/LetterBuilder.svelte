<script>
	import localstorage from 'services/local-storage'
	import Settings from 'components/Settings'
	import MenuBottom from 'components/MenuBottom'
	import Alert from 'components/Alert'
	import Btn from 'components/Btn'
	import api from 'services/api'
  import { getPrintFont } from 'services/api'
  import SVGFont from 'services/svgFont'
  import { placeholderLetter, BOT_SCALE } from '../../constants'
  import AxiDraw from 'services/axidraw'

  // TODO: sounds like this is basically what hershey does. But it does it better. 
  // So either call into their python, or find the python you need and translate--it looks like 
  // they've handled a lot of scaling logic too, so get this working in inkscape and try to hook it 
  // to the simulator? and then widdle down from there
  // otherwise, look through the code and try to convert accordingly
  // https://cdn.evilmadscientist.com/dl/ad/public/HersheyText_v30r5.pdf
  // " Its function is to replace the text in your document with paths from the selected SVG font" 
  // UPDATE: looks like this https://axidraw.com/doc/cli_api/#introduction allows giving an svg to a cli command...hmmm, look at how they handle curve commands in svg paths
  import segments from 'svg-line-segments'
  import linearize from 'svg-linearize'
  import { toPixels, toInches } from 'services/screen'
  import { cleanseHTML } from 'services/utils'
  import { get,set } from 'services/local-storage'

  const key = 'draft'
  let svgEl
  let letter = get('draft') || ''
  let svgPaths = []
  let svgFont = null
  let loading = false
  let error = null
  let currentPrintPathIndex = -1
  let abortJob = false
  let pauseJobAt = null
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
    // const { view, print } = await getSvgFont()
    // svgFont = new SVGFont(view)
    // svgFontPrint = new SVGFont(print)
    const svg = await getPrintFont()
    svgFont = new SVGFont(svg)
  }

  async function printLetter(startIndex) {
    error = letter == null || letter.trim() === '' ? 'Type a letter' : null
    if (error) return

    // convert svg paths to lines (coordinate arrays)
    lines = segments(svgEl) 

    // communicate to the axidraw machine
    pauseJobAt = null
    const axiDraw = new AxiDraw()
    await axiDraw.parkPen()
    for (let i = startIndex; i < lines.length; i++) {
       // if want to pause, break out--perhaps the pen ink stopped flowing, or they want to change the text at a later part that hasn't been printed yet
      if (pauseJobAt != null) return // TODO: pass a cancellationToken into axidraw class...so it stops immediately?
      currentPrintPathIndex = i
      const line = lines[i]
      const relativeLine = line.map(p => [
        p[0] / BOT_SCALE.factor + BOT_SCALE.offset,
        p[1] / BOT_SCALE.factor * BOT_SCALE.ratio
      ])
      await axiDraw.drawPath(relativeLine)
    }
    await axiDraw.parkPen()
    currentPrintPathIndex = -1
    pauseJobAt = null
  }
</script>

<MenuBottom>
  {#if pauseJobAt != null}
    <input type="number" bind:value={currentPrintPathIndex} max={lines.length-1} min={0} />
    <Btn icon="play" on:click={e => printLetter(currentPrintPathIndex)} disabled={loading}>Continue</Btn>
    <Btn icon="redo" on:click={e => printLetter(0)} disabled={loading}>Restart</Btn>
  {:else if currentPrintPathIndex > -1}
    <Btn icon="pause-circle" class="warning" on:click={e => pauseJobAt = currentPrintPathIndex} disabled={loading}>Pause</Btn>
  {:else}
    <Btn icon="print" on:click={e => printLetter(0)} disabled={loading}>Print</Btn>
  {/if}
</MenuBottom>
<Settings onChange={s => settings = s} />
<Alert type="danger" msg={error} />

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
          font-family: {svgFont.font.id};
          line-height: {svgFont.lineHeight}px;"></div>
    
      <h3 class="preview-heading">Preview</h3>
      <div class="preview">
        <svg bind:this={svgEl} {width} {height} xmlns="http://www.w3.org/2000/svg">
          <g transform="translate({paddingX}, {paddingY})">
            {#each svgPaths as p,i}
              <g transform="translate(0, {p.horizAdvY}) scale({svgFont.size})">
                <path 
                  class:printing={currentPrintPathIndex === i} 
                  transform="translate({p.horizAdvX},{p.horizAdvY}) rotate(180) scale(-1, 1)" d={p.d} />
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