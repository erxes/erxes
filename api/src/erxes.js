/* globals API_URL */
/* eslint-disable no-console */

import { createClass } from 'asteroid';
import { collectionItemAdded, collectionItemChanged } from './actions';
import render from './template';
import '../sass/style.scss';


const Asteroid = createClass();
let asteroid;

// whether subscriptions are made
let conversationSubId;
let messageSubId;

/**
 * Subscribes conversations.
 * If conversations subscription is already made resubscription will be made.
 */
function subscribeConversations() {
  if (conversationSubId) {
    asteroid.unsubscribe(conversationSubId);
    asteroid.subscriptions.cache.del(conversationSubId);
  }

  conversationSubId = asteroid.subscribe('api.conversations').id;
}

/**
 * Subscribes messages.
 * If messages subscription is already made resubscription will be made.
 */
function subscribeMessages(conversationId) {
  if (messageSubId) {
    asteroid.unsubscribe(messageSubId);
    asteroid.subscriptions.cache.del(messageSubId);
  }

  messageSubId = asteroid.subscribe('api.messages', conversationId).id;
}

/**
 * Calls asteroid method
 * @param  {String} name - method name
 * @param  {Object} params
 * @return {Promise}
 */
function call(name, ...params) {
  if (!asteroid) {
    throw Error('Not connected to the DDP server');
  }

  return asteroid.call(`api.${name}`, ...params);
}

/**
 * Connects to the DDP server
 * @param  {Object} options.settings
 * @param  {Object} options.dom
 */
function connect({ settings, dom }) {
  asteroid = new Asteroid({ endpoint: API_URL });

  asteroid.ddp.on('connected', () => {
    call('connect', settings)
      .then(() => {
        subscribeConversations();

        const div = dom.createElement('div');
        div.setAttribute('id', 'erxes-widget');
        dom.body.appendChild(div);
        render(div);
      })
      .catch(error => {
        console.error('Error on connecting to the DDP server', error);
      });
  });

  // Event that fires when a new document has been added
  asteroid.ddp.on('added', ({ collection, id, fields }) => {
    collectionItemAdded({ collection, _id: id, fields });
  });

  // Event that fires when a document has been changed
  asteroid.ddp.on('changed', ({ collection, id, fields, cleared }) => {
    collectionItemChanged({ collection, _id: id, fields, cleared });
  });
}

function disconnect({ dom }) {
  const { document } = dom;
  const widget = document.getElementById('erxes-widget');
  document.body.removeChild(widget);
}

global.Erxes = { connect, disconnect };

export {
  subscribeMessages,
  call,
};
