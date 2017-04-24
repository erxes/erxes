/* global ROOT_URL */

/*
 * Chat's embeddable script
 */

// import settings from '../../settings';

// css
import './index.css';

// add iframe
let iframe = document.createElement('iframe');
iframe.id = 'erxes-iframe';
iframe.className = 'erxes-form-hidden';
iframe.src = `${ROOT_URL}/chat`;
iframe.style.display = 'none';

document.body.appendChild(iframe);

// send erxes settings to iframe
iframe = document.querySelector('#erxes-iframe');

// after iframe load send connection info
iframe.onload = () => {
  iframe.style.display = 'inherit';

  iframe.contentWindow.postMessage({
    fromPublisher: true,
    settings: window.erxesSettings,
  }, '*');
};

// listen for widget toggle
window.addEventListener('message', (event) => {
  if (event.data.fromErxes) {
    iframe = document.querySelector('#erxes-iframe');

    iframe.className = 'erxes-form-shown';

    if (event.data.isFormVisible) {
      iframe.className = 'erxes-form-hidden';
    }
  }
});
