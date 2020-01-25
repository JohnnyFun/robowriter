## Setup

- install node/npm
- `npm i`
- `npm run client` to start the webpack-dev-server
- `npm run server` to run backend express server and watch for server code changes

## Using

- axidraw machine
  - plugin machine
  - connect machine usb to computer that is running this app
  - type into wysiwyg editor
  - click "print"
    - you can also print using the simulator
    - you can also debug by taking a look at what svg paths will be sent to the printer

## Tests

- `npm run test`
  - take a look in ./tests folder


## Adding Font

- used online ttf to svg converter to generate the svg glyphs
  - https://convertio.co/download/817b03b5afd5063d4e178b7acde94792c887cc/
- then used `SVGFont.js` to convert the glyphs to svg `path`s

