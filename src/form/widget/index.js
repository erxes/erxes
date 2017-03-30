/*
 * Form's embeddable script
 */

import settings from '../../settings';

// css
import './index.css';

const DOMAIN = settings.DOMAIN;

// add iframe
let iframe = document.createElement('iframe');
iframe.id = 'erxes-iframe';
iframe.src = `${DOMAIN}/form`;
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

// listen for messages from widget
window.addEventListener('message', (event) => {
  const data = event.data;

  if (!data.fromErxes) {
    return;
  }

  if (data.action === 'connected') {
    const loadType = data.connectionInfo.formConnect.formLoadType;

    if (loadType === 'embedded') {
      iframe.className = 'erxes-embed-iframe';
      document.querySelector('[data-erxes-embed]').appendChild(iframe);
    }

    if (loadType === 'popup') {
      iframe.className = 'erxes-modal-iframe hidden';

      document.querySelectorAll('[data-erxes-modal]').forEach((elm) => {
        elm.addEventListener('click', () => {
          iframe.className = 'erxes-modal-iframe';
        });
      });
    }

    if (loadType === 'shoutbox') {
      iframe.className = 'erxes-shoutbox-iframe';
    }

    return;
  }

  // user clicked the close button in modal
  if (data.closeModal) {
    iframe.className = 'erxes-modal-iframe hidden';
    return;
  }

  // user clicked shoutbox's widget
  if (data.fromShoutbox) {
    iframe.className = `erxes-shoutbox-iframe erxes-shoutbox-form-${data.isVisible ? 'shown' : 'hidden'}`;
  }
});
