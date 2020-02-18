## Description

  - build up an svg version of the letter with an svg font
  - send that svg to axidraw cli to plot with axidraw machine via usb

## Run the app

- Docker
  - `docker-compose up`
    - does everything that the "No Docker" section does inside the docker container upon starting up
    - open http://localhost:5002/
    - issues:
      - If using Docker "toolbox" for windows home addition, you're probably better off just running directly on the host machine. It's a pain to get everything working with the virtualbox instance that's used to get around not having hyper-v
- No Docker
  - install dependencies
    - node/npm
    - python (for axidraw cli): https://www.python.org/download/
    - pip: https://pip.pypa.io/en/stable/installing/
  - axidraw and hershey-advanced cli
    - note the axidraw cli doesn't appear to be packaged in npm or pip, so it's just copied directly to the source of this project and we build it here
    - `cd ./axidraw_cli/AxiDraw_HTA_API_v254_r5`
    - `pip install .`
  - `npm i`
  - `npm start`
    - starts the webpack-dev-server and the express server, watching both for changes
    - open http://localhost:5002/
- Deployment
  - easiest would be to simply clone the repo on the machine that's connected to the axidraw via usb and make a shortcut to "start.sh" or "start.bat" on the homescreen
    - else, probably wouldn't be too tough to just wrap the app in an electron app and provide an installer and have it like a normal app on the computer
    

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

- Hershey-advanced defects settings currently are simply set to sane defaults in `hershey-advanced.js`. If you find you're changing them often, a UI could be built to pass those from client-side and save them to localstorage
- Hershey-advanced allows specifying different fonts at the svg text element level, but robowriter currently only allows one font to be used. Sometimes acronyms look better in a different font, so if that comes up, we can add that functionality to robowriter. Workaround would be to download the inkscape svg from robowriter, open in inkscape and use hershey-advanced in there and then print from there.

## TODO: Write tests
## Tests

- `npm run test`
  - take a look in ./tests folder

