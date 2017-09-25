/* global ROOT_URL */

/*
 * Knowledge base's embeddable script
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

const embedContainer = document.querySelector('[data-erxes-kbase]');
embedContainer.appendChild(erxesContainer);

// send erxes setting to iframe
iframe = document.querySelector(`#${iframeId}`);

// after iframe load send connection info
iframe.onload = () => {
  iframe.style.display = 'block';

  iframe.contentWindow.postMessage({
    fromPublisher: true,
    setting: window.erxesSettings.knowledgeBase,
  }, '*');
};
