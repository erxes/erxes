/* global ROOT_URL */

/*
 * Form's embeddable script
 */

// import settings from '../../settings';

// css
import './index.css';

// container
const erxesContainer = document.createElement('div');
erxesContainer.id = 'erxes-container';

// add iframe
let iframe = document.createElement('iframe');
iframe.id = 'erxes-iframe';
iframe.src = `${ROOT_URL}/form`;
iframe.style.display = 'none';

erxesContainer.appendChild(iframe);

// if there is an placeholder for embed then add new iframe to it
const embedContainer = document.querySelector('[data-erxes-embed]');

if (embedContainer) {
  embedContainer.appendChild(erxesContainer);

// otherwise add to body
} else {
  document.body.appendChild(erxesContainer);
}

// meta
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'initial-scale=1, width=device-width';
document.getElementsByTagName('head')[0].appendChild(meta);

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
    const loadType = data.connectionInfo.formConnect.formData.loadType;

    if (loadType === 'embedded') {
      erxesContainer.className = 'erxes-embed-iframe';
    }

    if (loadType === 'popup') {
      erxesContainer.className = 'erxes-modal-iframe hidden';

      document.querySelectorAll('[data-erxes-modal]').forEach((elm) => {
        elm.addEventListener('click', () => {
          const iframeDocument = iframe.contentWindow.document;

          erxesContainer.className = 'erxes-modal-iframe';
          iframeDocument.querySelector('.modal-form').className = 'modal-form open';
        });
      });
    }

    if (loadType === 'shoutbox') {
      erxesContainer.className = 'erxes-shoutbox-iframe erxes-shoutbox-form-hidden';
    }

    return;
  }

  // user clicked the close button in modal
  if (data.closeModal) {
    const iframeDocument = iframe.contentWindow.document;
    erxesContainer.className = 'erxes-modal-iframe hidden';
    iframeDocument.querySelector('.modal-form').className = 'modal-form';
    return;
  }

  // user clicked shoutbox's widget
  if (data.fromShoutbox) {
    erxesContainer.className = `erxes-shoutbox-iframe erxes-shoutbox-form-${data.isVisible ? 'shown' : 'hidden'}`;
  }
});
