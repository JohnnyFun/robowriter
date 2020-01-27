import linearize from 'svg-linearize'
import {get,set} from 'services/local-storage'
import { hash } from 'services/utils'

// inspired by: https://stackoverflow.com/questions/7742148/how-to-convert-text-to-svg-paths
export default class SVGFont {
    constructor(svgString) {
        this.font = {}
        this.glyphs = {}
        this.svgString = svgString
        this._parseSVGInfo(svgString)
        this.linearize(.1, 100) // TODO: according to hershey, this should NOT be necessary: https://gitlab.com/oskay/hershey-text/blob/master/hershey-text/hershey.py "- Arbitrary curves are supported within glyphs; we are no longer limited tothe straight line segments used in the historical Hershey format."
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

    // returns xml for SVG paths representing this the given string and size
    textToPaths(text, fontSize, useLinearized = false) {
        const unitsPerEm = this.font.fontFace['units-per-em']
        const ascent = this.font.fontFace.ascent
        const descent = this.font.fontFace.descent
        this.size = fontSize / unitsPerEm
        this.lineHeight = fontSize + 5
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
                const d = useLinearized ? this.glyphsLinearized[char] : this.glyphs[char].d
                if (d) {
                    // space chars, for instance don't have a d, but we want to move horizontally still
                    paths.push({
                        horizAdvX,
                        horizAdvY,
                        d
                    })
                }
                horizAdvX += this.glyphs[char]['horiz-adv-x'] || 1000
            }
            const isEmptyLine = line.length === 0
            const offSetY = isEmptyLine ? -20 : 0
            horizAdvY += this.lineHeight + offSetY // (ascent + descent) / unitsPerEm TODO: figure out how tall lines should be dynamically
        })
        return paths
    }
}