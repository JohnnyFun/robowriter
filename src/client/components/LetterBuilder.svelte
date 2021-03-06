<script>
  import { tick } from 'svelte'
  import dayjs from 'dayjs'
	import GlobalErrors from 'components/GlobalErrors'
  import localstorage from 'services/local-storage'
	import Settings from 'components/Settings'
	import MenuBottom from 'components/MenuBottom'
	import Btn from 'components/Btn'
	import api from 'services/api'
  import { getPrintFont, getAlienBoy } from 'services/api'
  import SVGFont from 'services/svg-font'
  import websocket from 'services/websocket'
  import { inchesToPixels, pixelsToInches, inchesToMM, pixelsToMM } from 'services/screen'
  import { get,set } from 'services/local-storage'
  import errors from 'stores/global-errors'
  import { isEmpty } from 'shared/string-utils'

  const key = 'draft'
  let svgContainerEl
  let svgPreviewContainerEl
  let letterContentEditableEl
  let previewEl
  let letter = get(key) || ''
  let letterTransformed = ''
  let svgFont = null
  let settings = {}
  let textLines = []
  let awaitingPreview = false
  let printing = false
  let preview = null
  let axidrawPreview = null
  let showPaths = false
  let printJobs = {}

  init()

  $: set(key, letter)

  $: fontSize = settings.fontSize
  $: heightInches = settings.heightInches
  $: widthInches = settings.widthInches
  $: paddingXInches = settings.paddingXInches
  $: paddingYInches = settings.paddingYInches

  $: height = inchesToPixels(heightInches)
  $: width = inchesToPixels(widthInches)
  $: paddingX = inchesToPixels(paddingXInches)
  $: paddingY = inchesToPixels(paddingYInches)

  $: fontSizeMM = pixelsToMM(fontSize)
  $: heightMM = inchesToMM(heightInches)
  $: widthMM = inchesToMM(widthInches)
  $: paddingXMM = inchesToMM(paddingXInches)
  $: paddingYMM = inchesToMM(paddingYInches)

  $: lineHeight = svgFont != null ? pixelsToMM(svgFont.calcLineHeight(fontSize)) : 0

  $: letter, svgFont, letterContentEditableEl, getTextLines()

  $: svgfilename = `robowriter-letter-${dayjs().format('YYYY-MM-DD_HH-mm')}.svg`
  $: previewsReady = preview !== null && axidrawPreview !== null

  function getTextLines() {
    if (svgFont == null || letterContentEditableEl == null || isEmpty(letter)) return []

    // clear any preview rendered, so it's clear you're starting over the process and will need to re-render
    preview = null
    axidrawPreview = null

    // extract only the text from the html, leaving newline characters. alternatively could simply use a textarea instead of content editable
    const text = letterContentEditableEl.innerText 
    textLines = transformTextToLines(text)
  }

  function transformTextToLines(text) {
    // build the data needed to construct svg paths to send to hershey (similar to as you type in inkscape)
    text = text.replace(/\n\n/g, '\n') // doubles up line breaks
    const paragraphs = text.split('\n')
    let x = paddingXMM
    let y = paddingYMM
    let lines = []
    const unitsPerEm = svgFont.font.fontFace['units-per-em']
    const spaceCharWidth = unitsPerEm / 3
    const size = svgFont.calcSize(fontSize)
    // not quite x2, so it doesn't break onto new line too aggressively--a bit into the margin is fine and feels more natural
    const maxLineWidth = width - (paddingX * 1.8)
    paragraphs.forEach(lb => {
      // not word boundary, since we want periods and commas to stay with their word, for instance
      const words = lb.split(/\s/).map(w => w + ' ') 
      let currentLine = ''
      let currentLineWidth = 0
      for (let i = 0; i < words.length; i++) {
        const w = words[i]

        const wordWidth = Array.from(w).map(char => {
          // when text is pasted, we may not have all the characters, so warn so the character can be replaced
          if (svgFont.glyphs[char] == null) console.warn(`Unknown character in your font: '${char}'`)
          const charWidth = svgFont.glyphs[char] ? svgFont.glyphs[char]['horiz-adv-x'] || spaceCharWidth : spaceCharWidth
          return charWidth * size
        }).reduce((a,b) => a + b)

        const willConsume = currentLineWidth + wordWidth
        if (willConsume < maxLineWidth) {
          // enough room for this word
          currentLine += w
          currentLineWidth += wordWidth
        } else {
          // break to next line
          lines.push({ text: currentLine, x, y })
          y += lineHeight
          currentLine = w
          currentLineWidth = wordWidth
        }
        // if end of paragraph, add what's left
        const isLastWord = i === words.length - 1
        if (isLastWord) lines.push({ text: currentLine, x, y })
      }
      const yOffset = lines.length === 0 ? -fontSize*0.2857142857142857 : 0 // paragraph
      y += lineHeight + yOffset
    })
    return lines
  }

  async function init() {
    websocket.on('print', async msg => {
      msg = JSON.parse(msg)
      if (msg.error) {
        errors.add(msg.error)
        awaitingPreview = false
        printing = false
        document.body.scrollIntoView({behavior: "smooth"})
      }
      // if (msg.info) console.log(msg.info)
      if (msg.preview) {
        preview = msg.preview
      }
      if (msg.axidrawPreview) {
        axidrawPreview = msg.axidrawPreview
      }
      if (preview && axidrawPreview) {
        awaitingPreview = false
        await tick()
        if (previewEl) previewEl.scrollIntoView({behavior: "smooth"})
      }
      if (msg.done) {
        printing = false
      }
      if (msg.aborted) {
        printing = false
      }
    })
    const svg = await getPrintFont()
    svgFont = new SVGFont(svg)
  }

  function abort(opts = null) {
    websocket.emit('abort', opts)
  }

  function previewLetter(opts = {}) {
    if (isEmpty(letter)) {
      errors.add('Type a letter')
      return
    }
    awaitingPreview = true
    websocket.emit('preview', { 
      inputFile: svgContainerEl.innerHTML
    })
  }

  async function printLetter(opts = {}) {
    if (isEmpty(preview)) throw new Error('Preview not rendered')
    printing = true
    websocket.emit('print', {
      inputFile: preview
    })
  }

  function downloadSvg() {
    let link = document.createElement('a')
    link.download = svgfilename
    const svg = svgContainerEl.innerHTML
    const blob = new Blob([svg], {type: 'image/svg+xml'})
    link.href = window.URL.createObjectURL(blob);
    link.click();
  }

  // Quick n dirty tests
  // TODO: move into tests library later. the below tests depend on the svgFont being used and the padding/margin settings
  function transformTextToLinesTests() {
    const assert = (ctx, input, expected) => {
      const result = JSON.stringify(transformTextToLines(input))
      if (result !== JSON.stringify(expected)) console.error(Error(`FAIL ${ctx}\nRESULT: \n${result}\nExpected\n: ${expected}`))
      console.log(`TEST ${ctx} passed`)
    }
    assert('basic', 'Hi there!', [{"text":"Hi there! ","x":20.32,"y":25.4}])
    assert('new lines work', `Hi there,


"Being Adam Parrish was a complicated thing"`, [{"text":"Hi there, ","x":20.32,"y":25.4},{"text":" ","x":20.32,"y":35.2180914984809},{"text":"\"Being Adam Parrish was a complicated thing\" ","x":20.32,"y":45.036182996961806}])
  }
  $: if (svgFont != null) transformTextToLinesTests()

</script>

<Settings onChange={s => settings = s} />
<GlobalErrors />
<MenuBottom>
  <Btn icon="download" on:click={e => downloadSvg()}>Download Inkscape SVG</Btn>
  <Btn icon="eye" on:click={e => previewLetter()} disabled={awaitingPreview}>
    {#if awaitingPreview}
      Rendering preview...
    {:else}
      {#if previewsReady}Update{:else}Print{/if} preview
    {/if}
  </Btn>
  {#if previewsReady}
    <Btn icon="print" on:click={e => printLetter()} disabled={printing}>
      {#if printing}Printing...{:else}Print{/if}
    </Btn>
  {/if}
  {#if printing}
    <Btn icon="abort" on:click={e => abort()}>Abort</Btn>
  {/if}
</MenuBottom>
<!-- TODO: more settings: 
    - override lineheight ratio to font-size and character spacing ratio to font-size
    - hershey defects
  -->
{#if svgFont}
  <div class="paper-container">
    <div class="paper-contents" style="width: {width}px;">
      <div 
        class="editor" 
        contenteditable="true" 
        bind:this={letterContentEditableEl}
        bind:innerHTML={letter}
        style="width: {width}px; 
          height: {height}px; 
          max-height: {height}px; 
          padding: {paddingY-26}px {paddingX}px; 
          font-size: {fontSize}px; 
          font-family: {svgFont.font.id};
          line-height: {svgFont.calcLineHeight(fontSize)}px;"></div>
      {#if previewsReady}
        <div class="center p-4" bind:this={previewEl}>
          <h1>Hershey advanced preview</h1>
          <Btn on:click={e => showPaths = !showPaths} icon="edit">
            {#if showPaths}Hide{:else}Show{/if} axidraw path
          </Btn>
        </div>
        <div bind:this={svgPreviewContainerEl} class="preview">
          {@html showPaths ? axidrawPreview : preview}
        </div>
      {/if}
        
      <!-- 
        This generated svg is ultimately what's sent to hershey. 
        It can also be opened in inkscape so you can use inkscape tooling if need be prior to printing, if needed
        It can help to make it visible for debugging purposes (to confirm that content-editable text is transformed to svg as expected)
      -->
      <div class="preview" style="visibility: hidden; width: {width}px; height: {height}px;" bind:this={svgContainerEl}>
        <svg
          xmlns:dc="http://purl.org/dc/elements/1.1/"
          xmlns:cc="http://creativecommons.org/ns#"
          xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
          xmlns:svg="http://www.w3.org/2000/svg"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
          xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
          id="svg{new Date().getTime()}"
          version="1.1"
          viewBox="0 0 {widthMM} {heightMM}"
          height="{heightMM}mm"
          width="{widthMM}mm"
          inkscape:version="0.92.4 (5da689c313, 2019-01-14)"
          sodipodi:docname="{svgfilename}">
          <sodipodi:namedview
            id="base"
            pagecolor="#ffffff"
            bordercolor="#666666"
            borderopacity="1.0"
            inkscape:pageopacity="0.0"
            inkscape:pageshadow="2"
            inkscape:zoom="1"
            inkscape:cx="187.20597"
            inkscape:cy="859.39627"
            inkscape:document-units="mm"
            inkscape:current-layer="layer1"
            showgrid="false"
            inkscape:window-width="1920"
            inkscape:window-height="1017"
            inkscape:window-x="-8"
            inkscape:window-y="-8"
            inkscape:window-maximized="1" />
          <metadata
            id="metadata5">
            <rdf:RDF>
              <cc:Work
                rdf:about="">
                <dc:format>image/svg+xml</dc:format>
                <dc:type
                  rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
                <dc:title></dc:title>
              </cc:Work>
            </rdf:RDF>
          </metadata>
          <g
            inkscape:label="Layer 1"
            inkscape:groupmode="layer"
            id="layer1">
            <text
              xml:space="preserve"
              style="font-style:normal;
                font-weight:normal;
                font-size: {fontSizeMM}px; 
                font-family: {svgFont.font.id};
                line-height: {svgFont.calcLineHeight(fontSize)}px;
                letter-spacing:{-fontSize * .009}px;
                word-spacing:0px;
                fill:#000000;
                fill-opacity:1;
                stroke:none;
                stroke-width:0.26458332"
              x={paddingX}
              y={paddingY}
              id="text12">
              {#each textLines as line, i}
                <tspan
                  sodipodi:role="line"
                  x={line.x}
                  y={line.y}
                  style="font-size:{fontSizeMM}px;stroke-width:0.26458332"
                  id="tspan{i}">  
                  {line.text}
                </tspan>
              {/each}
            </text>
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
  .paper-container {
    margin-top: 2rem;
    margin-bottom: 10rem;
  }
  .editor, .preview {
    color: #222;
    background-color: #fff;
    box-shadow: .4rem .4rem 1.1rem #888888;
    overflow: hidden;
    padding: 0;
    margin-bottom: 5rem;
  }
  .editor:focus {
    outline-color: transparent;
  }
  .center {
    text-align: center;
  }
</style>