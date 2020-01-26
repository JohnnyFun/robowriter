<script>
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
  
  let svgEl
  let letter = 'H' //placeholderLetter
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

  $: fontSize = settings.fontSize
  $: heightInches = settings.heightInches
  $: widthInches = settings.widthInches
  $: paddingXInches = settings.paddingXInches
  $: paddingYInches = settings.paddingYInches

  $: svgPaths = svgFont ? svgFont.textToPaths(letter, fontSize) : []

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
<textarea class="form-control" bind:value={letter}></textarea>
<div class="preview">
  <Alert type="danger" msg={error} />
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

<style>
  .preview {
    text-align: center;
  }
  svg {
    background-color: #fff;
    box-shadow: .4rem .4rem 1.1rem #888888;
    margin: 30px;
  }
  path {
    fill: #000;
  }
  .printing {
    fill: red;
  }
  textarea {
    min-height: 10rem;
  }
  input[type="number"] {
    width: 8rem;
  }
</style>