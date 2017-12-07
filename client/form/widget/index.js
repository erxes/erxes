/* global ROOT_URL */
/* eslint-disable no-param-reassign */

/*
 * Form's embeddable script
 */

// css
import './index.css';
import { getBrowserInfo } from '../../utils';

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

    iframe.contentWindow.postMessage({
      fromPublisher: true,
      setting,
    }, '*');
  };

  container = document.querySelector(`#${containerId}`);
  iframe = document.querySelector(`#${iframeId}`);

  return { container, iframe };
};

const addClassesToIframe = ({ formId, loadType, container, iframe }) => {
  if (loadType === 'embedded') {
    container.className = 'erxes-embed-iframe';
  }

  if (loadType === 'popup') {
    container.className = 'erxes-modal-iframe hidden';

    document.querySelectorAll(`[data-erxes-modal="${formId}"]`).forEach((elm) => {
      elm.addEventListener('click', () => {
        iframe.contentWindow.postMessage({
          fromPublisher: true,
          action: 'show',
        }, '*');

        container.className = 'erxes-modal-iframe';
      });
    });
  }

  if (loadType === 'shoutbox') {
    container.className = 'erxes-shoutbox-iframe erxes-shoutbox-form-hidden';
  }
};

const formSettings = window.erxesSettings.forms || [];

// create iframes and save with index
const iframesMapping = {};

formSettings.forEach((formSetting) => {
  formSetting.browserInfo = getBrowserInfo();
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

    // add classes according to load type
    return addClassesToIframe({
      formId: setting.form_id,
      loadType,
      container,
      iframe,
    });
  }

  // user clicked the close button in modal
  if (data.closeModal) {
    iframe.contentWindow.postMessage({
      fromPublisher: true,
      action: 'hide',
    }, '*');

    container.className = 'erxes-modal-iframe hidden';

    return null;
  }

  // user clicked shoutbox's widget
  if (data.fromShoutbox) {
    container.className = `erxes-shoutbox-iframe erxes-shoutbox-form-${data.isVisible ? 'shown' : 'hidden'}`;
  }

  return null;
});
