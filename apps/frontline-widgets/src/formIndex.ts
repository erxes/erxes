// css
import styles from './formstyle.css';
import { getLocalStorageItem } from './lib/utils';

// Inject styles into the page
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

export const generateIntegrationUrl = (): string => {
  const script =
    document.currentScript ||
    (() => {
      const scripts = document.getElementsByTagName('script');

      return scripts[scripts.length - 1];
    })();

  if (script && script instanceof HTMLScriptElement) {
    return script.src.replace(`/formBundle.js`, `/form`);
  }

  return '';
};

export const setErxesProperty = (name: string, value: any) => {
  const erxes = window.Erxes || {};

  erxes[name] = value;

  window.Erxes = erxes;
};

export const getBrowserInfo = async () => {
  if (window.location.hostname === 'localhost') {
    return {
      url: window.location.pathname,
      hostname: window.location.href,
      language: navigator.language,
      userAgent: navigator.userAgent,
      countryCode: 'MN',
    };
  }

  let location;

  try {
    const response = await fetch('https://geo.erxes.io');

    location = await response.json();
  } catch (e) {
    location = {
      city: '',
      remoteAddress: '',
      region: '',
      country: '',
      countryCode: '',
    };
  }

  return {
    remoteAddress: location.network,
    region: location.region,
    countryCode: location.countryCode,
    city: location.city,
    country: location.countryName,
    url: window.location.pathname,
    hostname: window.location.origin,
    language: navigator.language,
    userAgent: navigator.userAgent,
  };
};

export const listenForCommonRequests = async (event: any, iframe: any) => {
  const { message, fromErxes, source, key, value } = event.data;
  if (fromErxes && iframe?.contentWindow) {
    if (message === 'requestingBrowserInfo') {
      iframe.contentWindow.postMessage(
        {
          fromPublisher: true,
          source,
          message: 'sendingBrowserInfo',
          browserInfo: await getBrowserInfo(),
        },
        '*',
      );
    }

    if (message === 'setLocalStorageItem') {
      const erxesStorage = JSON.parse(localStorage.getItem('erxes') || '{}');

      erxesStorage[key] = value;

      localStorage.setItem('erxes', JSON.stringify(erxesStorage));
    }
  }
};

declare const window: any;

// add meta to head
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'initial-scale=1, width=device-width';
document.getElementsByTagName('head')[0].appendChild(meta);

type Settings = {
  form_id: string;
  channel_id: string;
  user_id?: string;
  css?: string;
  onAction?: () => void;
};

// create iframe helper
const createIframe = (settings: Settings) => {
  const formId = settings.form_id;

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
    iframe.style.height = 'auto';
    iframe.allowFullscreen = true;
  }

  iframe.src = generateIntegrationUrl();

  container.appendChild(iframe);

  // if there is an placeholder for embed then add new iframe to it
  const embedContainer = document.querySelector(
    `[data-erxes-embed="${formId}"]`,
  );

  if (embedContainer) {
    embedContainer.appendChild(container);

    // otherwise add to body
  } else {
    document.body.appendChild(container);
  }

  // send erxes settings to iframe
  // after iframe load send connection info
  iframe.onload = () => {
    iframe.style.display = 'inherit';

    const handlerSelector = `[data-erxes-modal="${settings.form_id}"]`;

    const contentWindow = iframe.contentWindow;

    if (!contentWindow) {
      return;
    }

    const modifiedSettings = { ...settings };

    // remove unpassable data
    if (modifiedSettings.onAction) {
      delete modifiedSettings.onAction;
    }

    contentWindow.postMessage(
      {
        fromPublisher: true,
        hasPopupHandlers: document.querySelectorAll(handlerSelector).length > 0,
        settings: modifiedSettings,
        storage: getLocalStorageItem('erxes'),
      },
      '*',
    );
  };

  return { container, iframe };
};

const postMessageToOne = (formId: string, data: any) => {
  const settingsAsString = Object.keys(iframesMapping).find((sas) => {
    const settings = JSON.parse(sas);

    return formId === settings.form_id;
  });

  if (!settingsAsString) {
    return;
  }

  const { iframe } = iframesMapping[settingsAsString];

  const contentWindow = iframe.contentWindow;

  if (!contentWindow) {
    return;
  }

  contentWindow.postMessage(
    {
      fromPublisher: true,
      formId,
      ...data,
    },
    '*',
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

const getMappingKey = (settings: Settings) =>
  JSON.stringify({
    form_id: settings.form_id,
    channel_id: settings.channel_id,
  });

const getSettings = (settings: Settings) =>
  formSettings.find(
    (s: Settings) =>
      s.channel_id === settings.channel_id && s.form_id === settings.form_id,
  );

formSettings.forEach((formSettings: Settings) => {
  iframesMapping[getMappingKey(formSettings)] = createIframe(formSettings);
});

// listen for messages from widget
window.addEventListener('message', async (event: MessageEvent) => {
  const data = event.data || {};
  const { fromErxes, source, message, settings } = data;

  if (!settings || source !== 'fromForms') {
    return null;
  }

  const { container, iframe } = iframesMapping[getMappingKey(settings)] || {};

  listenForCommonRequests(event, iframe);

  const completeSettings = getSettings(settings);

  if (!completeSettings) {
    return null;
  }

  if (!(fromErxes && source === 'fromForms')) {
    return null;
  }

  if (message === 'submitResponse' && completeSettings.onAction) {
    completeSettings.onAction(data);
  }

  if (message === 'connected') {
    const loadType =
      data.connectionInfo.widgetsLeadConnect.form.leadData.loadType;

    // track popup handlers
    if (loadType === 'popup') {
      const selector = `[data-erxes-modal="${settings.form_id}"]`;
      const elements = document.querySelectorAll(selector);

      // Using for instead of for to get correct element
      // tslint:disable-next-line
      for (let i = 0; i < elements.length; i++) {
        const elm = elements[i];

        elm.addEventListener('click', () => {
          iframe?.contentWindow.postMessage(
            {
              fromPublisher: true,
              action: 'showPopup',
              formId: settings.form_id,
            },
            '*',
          );
        });
      }
    }
  }

  if (message === 'changeContainerClass' && container) {
    container.className = data.className;
  }

  if (message === 'changeContainerStyle' && container) {
    container.style = data.style;
  }

  return null;
});
