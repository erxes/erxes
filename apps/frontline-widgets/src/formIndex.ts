import styles from './formstyle.css';
import {
  getLocalStorageItem,
  listenForCommonRequests as sharedListenForCommonRequests,
} from './lib/utils';

declare const window: any;

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

const INTEGRATION_URL = generateIntegrationUrl();

export const setErxesProperty = (name: string, value: any) => {
  const erxes = window.Erxes || {};

  erxes[name] = value;

  window.Erxes = erxes;
};

type Settings = {
  form_id: string;
  channel_id: string;
  user_id?: string;
  css?: string;
  onAction?: (data?: any) => void;
};

// SPA support: a host page may re-inject this <script> tag on every
// client-side route change (e.g. to pick up a different/updated
// window.erxesSettings.forms per dynamic page) instead of loading it once.
// Persisting this state on `window` (rather than module-scope consts, which
// reset on every re-execution) lets a re-injection reuse already-created
// iframes/listeners instead of duplicating them, while still discovering
// any newly-configured forms.
const erxesFormsGlobal: {
  iframesMapping: Record<string, { container: HTMLElement; iframe: any }>;
  popupHandlersAttached: Record<string, boolean>;
  initialized: boolean;
} = (window.__erxesFormsGlobal = window.__erxesFormsGlobal || {
  iframesMapping: {},
  popupHandlersAttached: {},
  initialized: false,
});

const { iframesMapping, popupHandlersAttached } = erxesFormsGlobal;

const getFormSettings = (): Settings[] => window.erxesSettings.forms || [];

const createIframe = (settings: Settings) => {
  const formId = settings.form_id;

  const containerId = `erxes-container-${formId}`;
  const iframeId = `erxes-iframe-${formId}`;
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
  }

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

  const embedContainer = document.querySelector(
    `[data-erxes-embed="${formId}"]`,
  );

  if (embedContainer) {
    embedContainer.appendChild(container);
  } else {
    document.body.appendChild(container);
  }

  iframe.onload = () => {
    iframe.style.display = 'inherit';

    if (iframe.contentDocument?.body) {
      iframe.contentDocument.body.style.background = 'transparent';
      iframe.contentDocument.body.style.backgroundColor = 'transparent';
    }

    const handlerSelector = `[data-erxes-modal="${settings.form_id}"]`;

    const contentWindow = iframe.contentWindow;

    if (!contentWindow) {
      return;
    }

    const modifiedSettings = { ...settings };

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

const getMappingKey = (settings: Settings) =>
  JSON.stringify({
    form_id: settings.form_id,
    channel_id: settings.channel_id,
  });

const getSettings = (settings: Settings) =>
  getFormSettings().find(
    (s: Settings) =>
      s.channel_id === settings.channel_id && s.form_id === settings.form_id,
  );

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
  getFormSettings().forEach((settings: Settings) => {
    const embedContainer = document.querySelector(
      `[data-erxes-embed="${settings.form_id}"]`,
    );

    if (embedContainer || isPopupForm(settings)) {
      initForm(settings);
    }
  });
};

const observeEmbedContainers = () => {
  const observer = new MutationObserver(() => {
    getFormSettings().forEach((settings: Settings) => {
      if (iframesMapping[getMappingKey(settings)]) {
        return;
      }

      const embedContainer = document.querySelector(
        `[data-erxes-embed="${settings.form_id}"]`,
      );

      if (embedContainer || isPopupForm(settings)) {
        initForm(settings);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

const runInitialSetup = () => {
  // One-time global setup: the showPopup/callFormSubmit/sendExtraFormContent
  // API, the viewport meta tag, the MutationObserver, and the single window
  // message listener. Re-running these on every script re-injection would
  // pile up duplicate listeners/observers without adding any capability —
  // initForms() below already re-scans getFormSettings() on every
  // execution, which is what actually needs to happen to pick up a
  // newly-injected/updated forms config.
  if (!erxesFormsGlobal.initialized) {
    erxesFormsGlobal.initialized = true;

    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'initial-scale=1, width=device-width';
    document.getElementsByTagName('head')[0].appendChild(meta);

    setErxesProperty('showPopup', (id: string) => {
      postMessageToOne(id, { action: 'showPopup' });
    });

    setErxesProperty('callFormSubmit', (id: string) => {
      postMessageToOne(id, { action: 'callSubmit' });
    });

    setErxesProperty('sendExtraFormContent', (id: string, html: string) => {
      postMessageToOne(id, { action: 'extraFormContent', html });
    });

    observeEmbedContainers();

    // listen for messages from widget
    window.addEventListener('message', async (event: MessageEvent) => {
      const data = event.data || {};
      const { fromErxes, source, message, settings } = data;

      if (!settings || source !== 'fromForms') {
        return null;
      }

      const { container, iframe } =
        iframesMapping[getMappingKey(settings)] || {};

      sharedListenForCommonRequests(event, iframe);

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

        if (loadType === 'popup' && !popupHandlersAttached[settings.form_id]) {
          popupHandlersAttached[settings.form_id] = true;

          document.addEventListener('click', (e) => {
            const trigger = (e.target as Element)?.closest?.(
              `[data-erxes-modal="${settings.form_id}"]`,
            );

            if (!trigger) {
              return;
            }

            iframe?.contentWindow?.postMessage(
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

      if (message === 'changeContainerClass' && container) {
        container.className = data.className;
      }

      if (message === 'changeContainerStyle' && iframe) {
        const heightMatch = (data.style as string).match(
          /height:\s*([\d.]+px)/,
        );
        if (heightMatch) {
          iframe.style.height = heightMatch[1];
        }
      }

      return null;
    });
  }

  initForms();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInitialSetup);
} else {
  runInitialSetup();
}
