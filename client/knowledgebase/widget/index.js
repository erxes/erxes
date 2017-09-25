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

const iframeId = 'erxes-knowledge-iframe';
const container = 'erxes-knowledge-container';

// container
const erxesContainer = document.createElement('div');
erxesContainer.id = container;
erxesContainer.className = '';

// add iframe
let iframe = document.createElement('iframe');
iframe.id = iframeId;
iframe.src = `${ROOT_URL}/knowledgebase`;
iframe.style.display = 'none';

erxesContainer.appendChild(iframe);

// if there is an placeholder for embed then add new iframe to it

const embedContainer = document.querySelector('[data-erxes-kbase]');
if (embedContainer) {
  embedContainer.appendChild(erxesContainer);
// otherwise add to body
} else {
  document.body.appendChild(erxesContainer);
}


// send erxes setting to iframe
iframe = document.querySelector(`#${iframeId}`);

// after iframe load send connection info
iframe.onload = () => {
  iframe.style.display = 'block';

  iframe.contentWindow.postMessage({
    fromPublisher: true,
    setting: {
      ...window.erxesSettings.knowledgeBase,
      browserInfo: {
        url: location.pathname, // eslint-disable-line
        language: parent.navigator.language, // eslint-disable-line
      },
    },
  }, '*');
};
