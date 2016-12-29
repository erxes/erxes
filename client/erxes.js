import { createClass } from 'asteroid';
import settings from '../settings';

const Asteroid = createClass();
let asteroid;

/**
 * Calls asteroid method
 * @param  {String} name - method name
 * @param  {Object} params
 * @return {Promise}
 */
export const call = (name, ...params) => {
  if (!asteroid) {
    throw Error('Not connected to the DDP server');
  }

  return asteroid.call(`api.${name}`, ...params);
};

/**
 * Connects to the DDP server
 * @param  {Object} options.settings
 * @param  {Object} options.dom
 */
export const connect = () => {
  asteroid = new Asteroid({
    endpoint: settings.DDP_URL,
  });

  asteroid.ddp.on('connected', () => {});
};
