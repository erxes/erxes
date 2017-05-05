/* global ROOT_URL */

/*
 * InApp message's embeddable script
 */

// css
import './index.css';

// add iframe
const erxesContainer = document.createElement('div');
erxesContainer.id = 'erxes-container';
erxesContainer.className = 'erxes-messenger-hidden';

let iframe = document.createElement('iframe');
iframe.id = 'erxes-iframe';
iframe.src = `${ROOT_URL}/inapp`;
iframe.style.display = 'none';

erxesContainer.appendChild(iframe);
document.body.appendChild(erxesContainer);

// meta
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'initial-scale=1, width=device-width';
document.getElementsByTagName('head')[0].appendChild(meta);

// send erxes settings to iframe
iframe = document.querySelector('#erxes-iframe');

// after iframe load send connection info
iframe.onload = () => {
  iframe.style.display = 'block';

  iframe.contentWindow.postMessage({
    fromPublisher: true,
    settings: window.erxesSettings,
  }, '*');
};

// listen for widget toggle
window.addEventListener('message', (event) => {
  if (event.data.fromErxes) {
    iframe = document.querySelector('#erxes-iframe');

    erxesContainer.className = 'erxes-messenger-hidden';

    if (event.data.isMessengerVisible) {
      erxesContainer.className = 'erxes-messenger-shown';
    }
  }
});
