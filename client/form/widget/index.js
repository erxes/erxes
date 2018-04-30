/* global ROOT_URL */
/* eslint-disable no-param-reassign */

/*
 * Form's embeddable script
 */

// css
import './index.css';

// add meta to head
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'initial-scale=1, width=device-width';
document.getElementsByTagName('head')[0].appendChild(meta);

// create iframe helper
const createIframe = (setting) => {
  const formId = setting.form_id;

  // container
  let container = document.createElement('div');
  const containerId = `erxes-container-${formId}`;
  const iframeId = `erxes-iframe-${formId}`;

  container.id = containerId;

  // add iframe
  let iframe = document.createElement('iframe');

  iframe.id = iframeId;
  iframe.src = `${ROOT_URL}/form`;
  iframe.style.display = 'none';
  iframe.style.width = '100%';
  iframe.style.margin = '0 auto';
  iframe.style.height = '100%';

  container.appendChild(iframe);

  // if there is an placeholder for embed then add new iframe to it
  const embedContainer = document.querySelector(`[data-erxes-embed="${formId}"]`);

  if (embedContainer) {
    embedContainer.appendChild(container);

    // otherwise add to body
  } else {
    document.body.appendChild(container);
  }

  iframe = document.querySelector(`#${iframeId}`);

  // send erxes setting to iframe
  // after iframe load send connection info
  iframe.onload = () => {
    iframe.style.display = 'inherit';

    const handlerSelector = `[data-erxes-modal="${setting.form_id}"]`;

    iframe.contentWindow.postMessage({
      fromPublisher: true,
      hasPopupHandlers: document.querySelectorAll(handlerSelector).length > 0,
      setting,
    }, '*');
  };

  container = document.querySelector(`#${containerId}`);
  iframe = document.querySelector(`#${iframeId}`);

  return { container, iframe };
};

const formSettings = window.erxesSettings.forms || [];

// create iframes and save with index
const iframesMapping = {};

formSettings.forEach(formSetting => {
  iframesMapping[JSON.stringify(formSetting)] = createIframe(formSetting);
});

// listen for messages from widget
window.addEventListener('message', (event) => {
  const data = event.data;

  if (!(data.fromErxes && data.fromForms)) {
    return null;
  }

  const setting = data.setting;

  const { container, iframe } = iframesMapping[JSON.stringify(setting)];

  if (data.action === 'connected') {
    const loadType = data.connectionInfo.formConnect.formData.loadType;

    // track popup handlers
    if (loadType === 'popup') {
      const selector = `[data-erxes-modal="${setting.form_id}"]`;

      document.querySelectorAll(selector).forEach((elm) => {
        elm.addEventListener('click', () => {
          iframe.contentWindow.postMessage({
            fromPublisher: true,
            action: 'showPopup',
          }, '*');
        });
      });
    }
  }

  if (data.action === 'changeContainerClass') {
    container.className = data.className;
  }

  if (data.action === 'changeContainerStyle') {
    container.style = data.style;
  }

  return null;
});
