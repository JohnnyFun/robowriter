## Description

  - build up an svg version of the letter with an svg font
  - send that svg to axidraw cli to plot with axidraw machine via usb

## Setup

- Docker
  - `docker-compose up`
    - does everything that the "No Docker" section does inside the docker container upon starting up
    - open http://localhost:5002/
- No Docker
  - install dependencies
    - node/npm
    - python (for axidraw cli): https://www.python.org/download/
    - pip: https://pip.pypa.io/en/stable/installing/
    - axidraw cli
      - note the axidraw cli doesn't appear to be packaged in npm or pip, so it's just copied directly to the source of this project and we build it here
      - `cd ./axidraw_cli/AxiDraw_HTA_API_v254_r5`
      - `pip install .`
  - `npm i`
  - `npm start`
    - starts the webpack-dev-server and the express server, watching both for changes
    - open http://localhost:5002/
    

## Using

- axidraw machine
  - plugin machine to the wall so it has power
  - make sure pen is setup
  - connect machine(s) to computer via usb that is running this app
  - type into the letter input
  - click "print preview"
  - confirm preview looks correct
  - click "print"
  - machine should begin printing

# Notes

- Hershey-advanced allows specifying different fonts at the svg text element level, but robowriter currently only allows one font to be used. Sometimes acronyms look better in a different font, so if that comes up, we can add that functionality to robowriter. Workaround would be to download the inkscape svg from robowriter, open in inkscape and use hershey-advanced in there and then print from there.

## TODO: Write tests
## Tests

- `npm run test`
  - take a look in ./tests folder

