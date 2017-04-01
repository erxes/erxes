/* global ROOT_URL */

/*
 * InApp message's embeddable script
 */

// css
import './index.css';

// add iframe
let iframe = document.createElement('iframe');
iframe.id = 'erxes-iframe';
iframe.className = 'erxes-messenger-hidden';
iframe.src = `${ROOT_URL}/inapp`;
iframe.style.display = 'none';

document.body.appendChild(iframe);

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

    iframe.className = 'erxes-messenger-hidden';

    if (event.data.isMessengerVisible) {
      iframe.className = 'erxes-messenger-shown';
    }
  }
});
