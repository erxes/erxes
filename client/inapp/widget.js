/*
 * InApp message's embeddable script
 */

import settings from '../../settings';

const API_URL = settings.API_URL;

// add iframe
let iframe = document.createElement('iframe');
iframe.id = 'erxes-iframe';
iframe.src = `${API_URL}/inapp`;
iframe.className = 'erxes-messenger-hidden';

document.body.appendChild(iframe);

// send erxes settings to iframe
iframe = document.querySelector('#erxes-iframe');

// after iframe load send connection info
iframe.onload = () => {
  iframe.contentWindow.postMessage({
    fromPublisher: true,
    settings: window.erxesSettings,
  }, '*');
};

// create style
const link = document.createElement('link');

link.id = 'erxes';
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = `${API_URL}/inapp/iframe.css`;
link.media = 'all';

// add style to head
const head = document.getElementsByTagName('head')[0];
head.appendChild(link);

// listen for widget toggle
window.addEventListener('message', (event) => {
  if (event.data.fromErxes) {
    iframe = document.querySelector('#erxes-iframe');

    iframe.className = 'erxes-messenger-shown';

    if (event.data.isMessengerVisible) {
      iframe.className = 'erxes-messenger-hidden';
    }
  }
});
