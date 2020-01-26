// communicates with the cncserver via http
// https://github.com/techninja/cncserver
// endpoing docs: https://github.com/techninja/cncserver/blob/master/API.md
// they say it works well on limited hardware ("Raspberry PI verified")
// their code looks reasonable too and it seems to work great with the real axidraw machine
// and their simulator is helpful and seems accurate, though it'd be nice if it drew an svg on its end to assert it's doing what you want
import { ports } from '../../constants'
const API_URL = `http://localhost:${ports.simulator}/v1`;

export default class Axidraw {
  /**
   * Make axidraw bot draw a path consisting of multiple points. Coordinates
   * passed need to be in the range of [0, 100] (percent of drawing area).
   * @param {Array<array>} path  An array of points in form of [x, y]
   */
  async drawPath(path) {
    await this.setPenState('state=up');

    for (let i = 0; i < path.length; i++) {
      const [x, y] = path[i];

      await this.setPenState(`x=${x}&y=${y}`);

      if (i === 0) await this.setPenState('state=draw');
    }
  }

  /**
   * Set the state of the axidraw bot.
   * @param {String} state  The state in ''application/x-www-form-urlencoded'
   *  encoding
   */
  async setPenState(state) {
    await fetch(`${API_URL}/pen`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: state
    });
  }

  /**
   * Resets the axidraw bot motor.
   */
  async resetMotor() {
    await fetch(`${API_URL}/motors`, {method: 'DELETE'});
  }

  /**
   * Set pen state up and move to 0,0.
   */
  async parkPen() {
    await this.setPenState('state=up');
    await this.setPenState(`x=0&y=0`);
  }
}
