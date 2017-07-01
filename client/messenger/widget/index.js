/* global ROOT_URL */

/*
 * Messenger message's embeddable script
 */

// css
import './index.css';

// meta
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'initial-scale=1, width=device-width';
document.getElementsByTagName('head')[0].appendChild(meta);

const iframeId = 'erxes-messenger-iframe';
const container = 'erxes-messenger-container';

// container
const erxesContainer = document.createElement('div');
erxesContainer.id = container;
erxesContainer.className = 'erxes-messenger-hidden';

// add iframe
let iframe = document.createElement('iframe');
iframe.id = iframeId;
iframe.src = `${ROOT_URL}/messenger`;
iframe.style.display = 'none';

erxesContainer.appendChild(iframe);
document.body.appendChild(erxesContainer);

// send erxes setting to iframe
iframe = document.querySelector(`#${iframeId}`);

// after iframe load send connection info
iframe.onload = () => {
  iframe.style.display = 'block';

  iframe.contentWindow.postMessage({
    fromPublisher: true,
    setting: window.erxesSettings.messenger,
  }, '*');
};

// listen for widget toggle
window.addEventListener('message', (event) => {
  const data = event.data;

  if (data.fromErxes && data.fromMessenger) {
    iframe = document.querySelector(`#${iframeId}`);

    if (data.purpose === 'messenger') {
      erxesContainer.className = `erxes-messenger-${data.isVisible ? 'shown' : 'hidden'}`;
    }

    if (data.purpose === 'notifier') {
      erxesContainer.className += ` erxes-notifier-${data.isVisible ? 'shown' : 'hidden'}`;
    }

    if (data.purpose === 'notifierFull') {
      erxesContainer.className += ` erxes-notifier-${data.isVisible ? 'shown' : 'hidden'} fullMessage`;
    }
  }
});
