
// inspired by: https://stackoverflow.com/questions/7742148/how-to-convert-text-to-svg-paths
class SVGFont {
    font = {}
    glyphs = {}

    constructor(svgString) {
        this._parseSVGInfo(svgString)
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
                'descent'
            ]
            const val = numericAttributeNames.some(a => a === attr.name) ? parseFloat(attr.value) : attr.value
            callback(attr.name, val)
        }
    }

    // returns xml for SVG paths representing this the given string and size
    textToPaths(text, fontSize) {
        const unitsPerEm = this.font.fontFace['units-per-em']
        const ascent = this.font.fontFace.ascent
        const descent = this.font.fontFace.descent
        const size = fontSize / unitsPerEm
        const lines = text.split('\n')
        let result = ''
        let horizAdvY = 0
        lines.forEach(line => {
            result += `<g transform=\"translate(0, ${horizAdvY}) scale(${size})\">`
            let horizAdvX = 0
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const glyph = this.glyphs[char]
                if (glyph == null) {
                    console.warn(`Did not find glyph for "${char}"`)
                    continue
                }
                // if (glyph.d == null) {
                //     console.warn(`Did not find "d" for glyph char "${char}"`)
                //     continue
                // }
                result += `<path transform=\"translate(${horizAdvX},${horizAdvY}) rotate(180) scale(-1, 1)\" d=\"${this.glyphs[char].d || ''}\" />`
                horizAdvX += this.glyphs[char]['horiz-adv-x'] || 1000
            }
            result += "</g>"
            horizAdvY += 35 // (ascent + descent) / unitsPerEm TODO: figure out how tall lines should be dynamically
        })
        return result
    }
}