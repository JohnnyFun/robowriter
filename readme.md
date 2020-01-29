## Description

  - build up an svg version of the letter with an svg font
  - send that svg to axidraw cli to plot with axidraw machine via usb

## Setup

- TODO: setup docker container with the following:
  - node/npm
  - python 3.6 (for axidraw cli): https://www.python.org/download/
  - pip: https://pip.pypa.io/en/stable/installing/
  - axidraw cli: https://axidraw.com/doc/cli_api/
    - download it
    - cd /Users/username/Documents/axidraw-api/ 
    - `pip install -r requirements.txt` -- (On Windows, you may need to use "python -m pip install .")
  - open the ports for server and client in constants.js

- `npm i`
- `npm start`
  - starts the webpack-dev-server and the express server, watching both for changes

## Using

- axidraw machine
  - plugin machine
  - connect machine usb to computer that is running this app
  - type into the letter input
  - click "print"

## Tests

- `npm run test`
  - take a look in ./tests folder

