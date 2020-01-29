import linearize from 'svg-linearize'
import parseSvgPath from 'parse-svg-path'
import {get,set} from 'services/local-storage'
import { hash } from 'services/utils'

// inspired by: https://stackoverflow.com/questions/7742148/how-to-convert-text-to-svg-paths
export default class SVGFont {
    constructor(svgString) {
        this.font = {}
        this.glyphs = {}
        this.svgString = svgString
        this._parseSVGInfo(svgString)
        // this.linearize(.1, 100) // TODO: according to hershey, this should NOT be necessary: https://gitlab.com/oskay/hershey-text/blob/master/hershey-text/hershey.py "- Arbitrary curves are supported within glyphs; we are no longer limited tothe straight line segments used in the historical Hershey format."
        // this.rotateAndInvert()

        this.hersheyifyGlyphs()

        console.log('Font', this.font)
        console.log('Glyphs', this.glyphs)
    }

    _parseSVGInfo(svgString) {
        // skip anything before the opening svg tag
        this.svgString = svgString.slice(svgString.indexOf('<svg'))
        const parser = new DOMParser()
        const svgElement = parser.parseFromString(svgString, 'image/svg+xml')

        const font = svgElement.querySelector('font')
        if (font) {
            this._eachAttr(font.attributes, (n, v) => this.font[n] = v)
        }

        const fontface = svgElement.querySelector('font-face')
        if (fontface) {
            this.font.fontFace = {}
            this._eachAttr(fontface.attributes, (n, v) => this.font.fontFace[n] = v)
        }

        const glyphs = svgElement.querySelectorAll('glyph')
        if (glyphs) {
            if (glyphs.length === 0)
                throw new Error('No glyphs found in this svg')
            for (let i = 0; i < glyphs.length; i++) {
                const glyph = glyphs[i]
                const charAttr = 'unicode'
                const char = glyph.getAttribute(charAttr) || glyph.getAttribute('glyph-name')
                this.glyphs[char] = {}
                this._eachAttr(glyph.attributes, (n, v) => n !== charAttr ? this.glyphs[char][n] = v : null)
            }
        }
    }

    _eachAttr(attributes, callback) {
        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i]
            const numericAttributeNames = [
                'horiz-adv-x',
                'units-per-em',
                'ascent',
                'descent',
                'x-height',
                'cap-height',
                'underline-thickness',
                'underline-position'
            ]
            const val = numericAttributeNames.some(a => a === attr.name) ? parseFloat(attr.value) : attr.value
            callback(attr.name, val)
        }
    }

    linearize(tolerance, segments) {
        // TODO: only retain last 5 values in cache
        // TODO: show loading when dynamically linearizing
        // TODO: put work onto webworker(s) to parallelize the work (low priority since it gets cached)
        const key = `linearized_${tolerance}_${segments}_${hash(this.svgString)}`
        console.log(key)
        let linearized = get(key)
        if (linearized == null) {
            console.log('linearizing ', key)
            console.time('linearizing')
            linearized = {}
            Object.keys(this.glyphs).forEach(char => {
                if (this.glyphs[char].d != null) {
                    const curvedPathSvg = document.createElement('svg')
                    const path = document.createElement('path')
                    path.setAttribute('d', this.glyphs[char].d)
                    curvedPathSvg.appendChild(path)
                    const linearizedCurves = linearize(curvedPathSvg, {
                        tolerance, // higher value means fewer points, so less smooth,
                        segments // number of points to sample for the curve
                    })
                    const linearPath = linearizedCurves.querySelector('path')
                    linearized[char] = linearPath.getAttribute('d')
                }
            })
            set(key, linearized)
            this.glyphsLinearized = linearized
            console.timeEnd('linearizing')
        } else {
            this.glyphsLinearized = linearized
        }
    }

    calcSize(fontSize) {
        return fontSize / this.font.fontFace['units-per-em']
    }

    calcLineHeight(fontSize) {
        return this.font.fontFace.ascent * this.calcSize(fontSize)
    }

    // returns paths objects that can be translated into either svg <path> elements or x,y coordinate lines to send to axidraw machine
    textToPaths(text, fontSize) {
        const unitsPerEm = this.font.fontFace['units-per-em']
        const spaceCharWidth = unitsPerEm / 3
        const size = this.calcSize(fontSize)
        const lineHeight = this.calcLineHeight(fontSize)
        const lines = text.split('\n')
        let paths = []
        let horizAdvY = 0
        lines.forEach(line => {
            let horizAdvX = 0
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const glyph = this.glyphs[char]
                if (glyph == null) {
                    console.warn(`Did not find glyph for "${char}"`)
                    continue
                }
                const d = this.glyphs[char].d
                if (d) {
                    // space chars, for instance don't have a d, but we want to move horizontally still
                    // TODO: transform="rotate(180) scale(-1, 1)"
                    paths.push({
                        horizAdvX,
                        horizAdvY,
                        d,
                        //dLinear: this.glyphsLinearized[char],
                        line: this.glyphs[char].line
                    })
                }
                horizAdvX += (this.glyphs[char]['horiz-adv-x'] || spaceCharWidth) * size
            }
            const isEmptyLine = line.length === 0
            const offSetY = isEmptyLine ? -1700 * size : 0
            horizAdvY += lineHeight + offSetY
        })
        return paths
    }

    // TODO: this may be a misnomer...
    rotateAndInvert() {
        Object.keys(this.glyphs).forEach(char => {
            if (this.glyphsLinearized[char]) this.glyphs[char].line = this.glyphPathToLine(char)
        })
    }

    // TODO: have a look at: https://github.com/techninja/hersheytextjs/blob/master/lib/hersheytext.js ("glyphScale" function....)
    glyphPathToLine(char) {
        const cmds = parseSvgPath(this.glyphsLinearized[char])
        const notLinear = cmds.some(c => c[0] !== 'M' && c[0] !== 'L')
        if (notLinear) throw new Error('SVG must be simple linear x,y coordinates at this point. No curves allowed.')
        const line = cmds.map(c => {
            // rotate and scale...transform="rotate(180) scale(-1, 1)
            const x = c[1] - this.glyphs[char]['horiz-adv-x'] || 0
            const y = c[2] * -1
            return [x, y]
        })
        return line
    }

    hersheyifyGlyphs() {
        Object.keys(this.glyphs).forEach(char => {
            this.glyphs[char].d = glyphScale(this.glyphs[char].d, this.font.fontFace['units-per-em'], .1)
        })
    }
}

// from https://github.com/techninja/hersheytextjs/blob/master/lib/hersheytext.js
/**
 * Scale an SVG font glyph down (and flip the Y axis)
 *
 * @param {string} d
 *   SVG path d string value to be adjusted.
 * @param {number} height
 *   Maximum height for a char, used to flip along the Y axis.
 * @param {number} scale
 *   Value that will be multiplied against each x/y value to scale it.
 *
 * @returns {string}
 *   An adjusted d string with correct Y flip and given scale applied.
 */
function glyphScale(d, height, scale) {
    if (!d) {
      return d;
    };
  
    const pathInput = cleanD(d);
    const vals = pathInput.split(' ');
    const out = [];
  
    let lastVal = null;
    let lastOp = null; // Holds last move/line operation.
    let lastCoord = 'x'; // Flops between x and y.
    vals.forEach((val, index) => {
      let pf = Number.parseFloat(val);
  
      // Either a Move/Line
      if (Number.isNaN(pf)) {
        lastCoord = 'x';
  
        // Might have no space, try to parse
        if (val.length > 1) {
          lastOp = val.subStr(0, 1);
          out.push(lastOp);
          pf = Number.parseFloat(val.substr(1));
        } else {
          lastOp = val;
          out.push(lastOp);
        }
      }
  
      // When we actually have a number!
      if (!Number.isNaN(pf)) {
        if (lastCoord === 'x') {
          pf = Math.round(pf * scale * 100) / 100;
          out.push(pf);
          lastCoord = 'y'; // We know y is right after
        } else if (lastCoord === 'y') {
          pf = Math.round((height - pf) * scale * 100) / 100;
          out.push(pf);
        }
      }
    });
  
    return out.join(' ');
  }

  /**
 * Try to clean up an SVG d value so it's easier to parse it.
 *
 * @param {string} d
 *   SVG path d string value to be adjusted.
 *
 * @returns {string}
 *   An adjusted d string with spaced around control chars.
 */
function cleanD(d) {
    const out = [];
    let lastGood = true;
  
    [...d].forEach((char, index) =>{
      // If this isn't a space, period or negative...
      if (![' ', '.', '-'].includes(char)) {
        // If this is a parsable number...
        if (!Number.isNaN(Number.parseInt(char, 10))) {
          // If this number is immediately preceeded by a letter, add a space.
          if (!lastGood) {
            out.push(' ');
          }
          lastGood = true;
        } else {
          // Guaranteed a control char like L or M
          // Add a space before it.
          out.push(' ');
          lastGood = false;
        }
      } else {
        // If this negative is immediately preceeded by a letter, add a space.
        if (char === '-' && !lastGood) {
          out.push(' ');
        }
  
        // These chars can preceed a number.
        lastGood = true;
      }
  
      out.push(char);
    });
  
    return out.join('').trim().replace(/  /g, ' ');
  }