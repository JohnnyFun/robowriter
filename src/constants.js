const server = 5000
const client = 5002
const simulator = 5003
const buildUrl = port => `http://localhost:${port}`

module.exports = {
  ports: {
    server,
    client,
    simulator
  },
  urls: {
    server: buildUrl(server),
    client: buildUrl(client),
    simulator: buildUrl(simulator)
  },
  BOT_SCALE: {
    ratio: 12000 / 8720,
    factor: 14.2,
    offset: 20
  },
  placeholderLetter: `Hi there!

  I made you a package! It has treats for you to put in your mouth, 
taste, and swallow. Don't eat too many treats though.

Here's another paragraph. Each character is an SVG path, so the 
axidraw machine will be able to consume it and regurgitate it onto 
paper.

Still some work to do to make sure spacing, line height, etc look 
decent, but this should do the trick!

Sincerely,

- John`
}