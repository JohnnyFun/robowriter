// inspired by: https://stackoverflow.com/questions/7742148/how-to-convert-text-to-svg-paths
export default class SVGFont {
    constructor(svgString) {
        this.font = {}
        this.glyphs = {}
        this.svgString = svgString
        this._parseSVGInfo(svgString)
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
                    paths.push({
                        horizAdvX,
                        horizAdvY,
                        d,
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
}