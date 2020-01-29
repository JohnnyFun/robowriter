<script>
  // TODO: get variance stuff that hershey advanced apparently does:
  //       hershey's function is "to replace the text in your document with paths from the selected SVG font" https://cdn.evilmadscientist.com/dl/ad/public/HersheyText_v30r5.pdf 
  //       so this app's client-side functionality basically does what hershey does, just less setup
	import localstorage from 'services/local-storage'
	import Settings from 'components/Settings'
	import MenuBottom from 'components/MenuBottom'
	import Alert from 'components/Alert'
	import Btn from 'components/Btn'
	import api from 'services/api'
  import { getPrintFont, getAlienBoy } from 'services/api'
  import SVGFont from 'services/svgFont'
  import { placeholderLetter } from '../../constants'
  import websocket from 'services/websocket'
  import { toPixels, toInches } from 'services/screen'
  import { cleanseHTML } from 'services/utils'
  import { get,set } from 'services/local-storage'
  import error from 'stores/global-errors'

  const key = 'draft'
  let svgEl
  let letter = get('draft') || ''
  let svgPaths = []
  let svgFont = null
  let loading = false
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
    websocket.on('axidraw', msg => {
      msg = JSON.parse(msg)
      if (msg.error) {
        console.error(msg.error)
        $error = msg.error
      }
      if (msg.info) console.log(msg.info)
      if (msg.connected) connected.set(true)
    })
    const svg = await getPrintFont()
    svgFont = new SVGFont(svg)

    // const svgFriendly = await getNonPrintFont()
    // svgFontFriendly = new SVGFont(svgFriendly)


    // const alien = await getAlienBoy()
    // const newSVG = document.createElement('svg')
    // newSVG.innerHTML = alien
    // document.body.appendChild(newSVG)
    // printSVG(newSVG)
  }

  function print(opts) {
    websocket.emit('print', opts)
  }

  async function printLetter(startIndex) {
    $error = letter == null || letter.trim() === '' ? 'Type a letter' : null
    if ($error) return

    // TODO: extract svg portion into a component, make one hidden that contains the linearized version...print that

    // pauseJobAt = null
    // const axiDraw = new AxiDraw()
    // const size = svgFont.calcSize(fontSize)
    // await axiDraw.parkPen()
    // for (let i = startIndex; i < svgPaths.length; i++) {
    //    // if want to pause, break out--perhaps the pen ink stopped flowing, or they want to change the text at a later part that hasn't been printed yet
    //   if (pauseJobAt != null) return // TODO: pass a cancellationToken into axidraw class...so it stops immediately?
    //   currentPrintPathIndex = i
    //   const p = svgPaths[i]
    //   const relativeLine = p.line.map(pt => {
    //     // scale and transform both points
    //     // const BOT_SCALE = {
    //     //   ratio: 12000 / 8720,
    //     //   factor: 14.2,
    //     //   offset: 20
    //     // }
    //     const x = (pt[0] * size + paddingX + p.horizAdvX) / 3
    //     const y = (pt[1] * size + paddingY + p.horizAdvY) / 3
    //     console.log(x,y)
    //     return [x, y]
    //     // // TODO: also need to transform it accordingly (invert/rotate and move right/down accordingly)....reference "runNextPoint" in robopaint "cncserver.client.paths.js"--they use 
    //   })
    //   await axiDraw.drawPath(relativeLine)
    // }
    // await axiDraw.parkPen()
    // currentPrintPathIndex = -1
    // pauseJobAt = null
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
<Alert type="danger" msg={$error} />

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
      <div class="preview">
        <svg bind:this={svgEl} {width} {height} xmlns="http://www.w3.org/2000/svg">
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