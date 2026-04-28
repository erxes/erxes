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

// Capture the integration URL synchronously at module load time while
// document.currentScript is still available. After this point (e.g. inside
// DOMContentLoaded callbacks) document.currentScript is always null, so
// calling generateIntegrationUrl() there would fall back to the last <script>
// in the DOM — which is often the inline install script whose .src is '',
// causing iframe.src to be set to '' and the iframe to reload the host page.
const INTEGRATION_URL = generateIntegrationUrl();

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
    iframe.style.height = '100%';
    iframe.allowFullscreen = true;
    iframe.allowTransparency = true;
    iframe.style.background = 'transparent';
  }

  iframe.src = INTEGRATION_URL;

  container.appendChild(iframe);

  // if there is an placeholder for embed then add new iframe to it
  const embedContainer = document.querySelector(
    `[data-erxes-embed="${formId}"]`,
  );
  console.log('embedContainer', embedContainer);

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

    if (iframe.contentDocument?.body) {
      iframe.contentDocument.body.style.background = 'transparent';
    }

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

// Returns true if this form setting has a popup/modal trigger in the DOM.
// Popup forms should always be initialised eagerly (iframe lives on body, hidden).
// Embed forms should only be initialised once their placeholder element exists,
// because moving an iframe node in the DOM forces a reload.
const isPopupForm = (settings: Settings): boolean =>
  document.querySelectorAll(`[data-erxes-modal="${settings.form_id}"]`).length >
  0;

const initForm = (settings: Settings) => {
  const key = getMappingKey(settings);
  if (!iframesMapping[key]) {
    iframesMapping[key] = createIframe(settings);
  }
};

const initForms = () => {
  formSettings.forEach((settings: Settings) => {
    const embedContainer = document.querySelector(
      `[data-erxes-embed="${settings.form_id}"]`,
    );

    // Initialise immediately if:
    //   a) the embed placeholder is already in the DOM, or
    //   b) this is a popup/modal form (no embed placeholder expected)
    // Otherwise defer to the MutationObserver so the iframe is created directly
    // inside the embed target and never needs to be moved (which would reload it).
    if (embedContainer || isPopupForm(settings)) {
      initForm(settings);
    }
  });
};

// Watch for embed containers added after initial load (e.g. React/SPA rendering)
const observeEmbedContainers = () => {
  const observer = new MutationObserver(() => {
    formSettings.forEach((settings: Settings) => {
      const embedContainer = document.querySelector(
        `[data-erxes-embed="${settings.form_id}"]`,
      );
      if (embedContainer) {
        // Embed placeholder just appeared — create the iframe directly inside it.
        // We intentionally skip this in initForms when the placeholder is absent
        // so that we never have to move an already-loaded iframe (which reloads it).
        initForm(settings);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initForms();
    observeEmbedContainers();
  });
} else {
  initForms();
  observeEmbedContainers();
}

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

  if (message === 'changeContainerStyle' && iframe) {
    const heightMatch = (data.style as string).match(/height:\s*([\d.]+px)/);
    if (heightMatch) {
      iframe.style.height = heightMatch[1];
    }
  }

  return null;
});
