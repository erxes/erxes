/*
 * Form's embeddable script
 */

declare const window: any;

// css
import './index.css';

import {
  generateIntegrationUrl,
  getStorage,
  listenForCommonRequests,
  setErxesProperty
} from '../../widgetUtils';

// add meta to head
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'initial-scale=1, width=device-width';
document.getElementsByTagName('head')[0].appendChild(meta);

type Setting = {
  form_id: string;
  brand_id: string;
  css?: string;
  onAction?: () => void;
};

// create iframe helper
const createIframe = (setting: Setting) => {
  const formId = setting.form_id;

  // container
  const containerId = `erxes-container-${formId}`;
  const iframeId = `erxes-iframe-${formId}`;
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
  }

  // add iframe
  let iframe: any = document.getElementById(iframeId);

  if (!iframe) {
    iframe = document.createElement('iframe');

    iframe.id = iframeId;
    iframe.style.display = 'none';
    iframe.style.width = '100%';
    iframe.style.margin = '0 auto';
    iframe.style.height = '100%';
  }

  iframe.src = generateIntegrationUrl('form');

  container.appendChild(iframe);

  // if there is an placeholder for embed then add new iframe to it
  const embedContainer = document.querySelector(
    `[data-erxes-embed="${formId}"]`
  );

  if (embedContainer) {
    embedContainer.appendChild(container);

    // otherwise add to body
  } else {
    document.body.appendChild(container);
  }

  // send erxes setting to iframe
  // after iframe load send connection info
  iframe.onload = () => {
    iframe.style.display = 'inherit';

    const handlerSelector = `[data-erxes-modal="${setting.form_id}"]`;

    const contentWindow = iframe.contentWindow;

    if (!contentWindow) {
      return;
    }

    const modifiedSetting = { ...setting };

    // remove unpassable data
    if (modifiedSetting.onAction) {
      delete modifiedSetting.onAction;
    }

    contentWindow.postMessage(
      {
        fromPublisher: true,
        hasPopupHandlers: document.querySelectorAll(handlerSelector).length > 0,
        setting: modifiedSetting,
        storage: getStorage()
      },
      '*'
    );
  };

  return { container, iframe };
};

const postMessageToOne = (formId: string, data: any) => {
  const settingAsString = Object.keys(iframesMapping).find(sas => {
    const setting = JSON.parse(sas);

    return formId === setting.form_id;
  });

  if (!settingAsString) {
    return;
  }

  const { iframe } = iframesMapping[settingAsString];

  const contentWindow = iframe.contentWindow;

  if (!contentWindow) {
    return;
  }

  contentWindow.postMessage(
    {
      fromPublisher: true,
      formId,
      ...data
    },
    '*'
  );
};

setErxesProperty('showPopup', (id: string) => {
  postMessageToOne(id, { action: 'showPopup' });
});

setErxesProperty('callFormSubmit', (id: string) => {
  postMessageToOne(id, { action: 'callSubmit' });
});

setErxesProperty('sendExtraFormContent', (id: string, html: string) => {
  postMessageToOne(id, { action: 'extraFormContent', html });
});

const formSettings = window.erxesSettings.forms || [];

// create iframes and save with index
const iframesMapping: any = {};

 const getMappingKey = (setting: Setting) => 
  JSON.stringify({ form_id: setting.form_id, brand_id: setting.brand_id });

const getSetting = (setting: Setting) => 
  formSettings.find(
    (s: Setting) =>
      s.brand_id === setting.brand_id && s.form_id === setting.form_id
  );

formSettings.forEach((formSetting: Setting) => {
  iframesMapping[getMappingKey(formSetting)] = createIframe(formSetting);
});

// listen for messages from widget
window.addEventListener('message', async (event: MessageEvent) => {
  const data = event.data || {};
  const { fromErxes, source, message, setting } = data;

  if (!setting) {
    return null;
  }

  const { container, iframe } = iframesMapping[getMappingKey(setting)];

  listenForCommonRequests(event, iframe);

  const completeSetting = getSetting(setting);

  if (!completeSetting) {
    return null;
  }

  if (!(fromErxes && source === 'fromForms')) {
    return null;
  }


  if (message === 'submitResponse' && completeSetting.onAction) {
    completeSetting.onAction(data);
  }

  if (message === 'connected') {
    const loadType =
      data.connectionInfo.widgetsLeadConnect.integration.leadData.loadType;

    // track popup handlers
    if (loadType === 'popup') {
      const selector = `[data-erxes-modal="${setting.form_id}"]`;
      const elements = document.querySelectorAll(selector);

      // Using for instead of for to get correct element
      // tslint:disable-next-line
      for (let i = 0; i < elements.length; i++) {
        const elm = elements[i];

        elm.addEventListener('click', () => {
          iframe.contentWindow.postMessage(
            {
              fromPublisher: true,
              action: 'showPopup',
              formId: setting.form_id
            },
            '*'
          );
        });
      }
    }
  }

  if (message === 'changeContainerClass') {
    container.className = data.className;
  }

  if (message === 'changeContainerStyle') {
    container.style = data.style;
  }

  

  return null;
});
