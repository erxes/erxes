import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { RequestBrowserInfoParams } from '../app/messenger/types';

export const postMessage = (source: string, message: string, postData = {}) => {
  window.parent.postMessage(
    {
      fromErxes: true,
      source,
      message,
      ...postData,
    },
    '*',
  );
};

// get local storage item
export const getLocalStorageItem = (key: string): any => {
  return localStorage.getItem(key);
};

export const setLocalStorageItem = (key: string, value: any) => {
  localStorage.setItem(key, value);
};

export const removeLocalStorageItem = (key: string) => {
  localStorage.removeItem(key);
};

export const getVisitorId = async () => {
  const fp = await FingerprintJS.load();

  // The FingerprintJS agent is ready.
  const result = await fp.get();

  // This is the visitor identifier:
  return result.visitorId;
};

export const getErxesSettings = () => {
  return (
    (window as unknown as Window & { erxesSettings: any }).erxesSettings || {}
  );
};

export const requestBrowserInfo = ({
  source,
  postData = {},
  callback,
}: RequestBrowserInfoParams) => {
  postMessage(source, 'requestingBrowserInfo', postData);

  let messageHandler: ((event: MessageEvent) => void) | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  messageHandler = (event: any) => {
    const data = event.data || {};
    const { fromPublisher, message, browserInfo } = data;

    if (
      fromPublisher &&
      source === data.source &&
      message === 'sendingBrowserInfo'
    ) {
      if (messageHandler) {
        window.removeEventListener('message', messageHandler);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      callback(browserInfo);
    }
  };

  window.addEventListener('message', messageHandler);

  // Fallback: if no browser info is received within 2 seconds, use default
  timeoutId = setTimeout(() => {
    if (messageHandler) {
      window.removeEventListener('message', messageHandler);
    }
    callback({
      url: window.location.href,
      hostname: window.location.hostname,
      language: navigator.language,
      userAgent: navigator.userAgent,
    });
  }, 2000);
};

// ---------------------------------------------------------------------------
// Parent-page (host site) browser info — used by the loader scripts
// (index.ts / formIndex.ts), which run in the host page itself, to answer
// 'requestingBrowserInfo' messages sent by the widget iframe. window.location
// here is the host page's location, not the iframe's.
// ---------------------------------------------------------------------------

export type IHostBrowserInfo = {
  url: string;
  hostname: string;
  language: string;
  userAgent: string;
};

export const getBrowserInfo = (): IHostBrowserInfo => ({
  url: window.location.pathname,
  hostname: window.location.origin,
  language: navigator.language,
  userAgent: navigator.userAgent,
});

// Answers a 'requestingBrowserInfo' message from the widget iframe, and
// mirrors any 'setLocalStorageItem' request into localStorage. Shared by
// both loader scripts so an SPA host page gets identical behavior for the
// messenger widget and the embedded/popup forms.
export const listenForCommonRequests = (
  event: MessageEvent,
  iframe: HTMLIFrameElement | null | undefined,
) => {
  const { message, fromErxes, source, key, value } = event.data || {};

  if (!fromErxes || !iframe?.contentWindow) {
    return;
  }

  if (message === 'requestingBrowserInfo') {
    iframe.contentWindow.postMessage(
      {
        fromPublisher: true,
        source,
        message: 'sendingBrowserInfo',
        browserInfo: getBrowserInfo(),
      },
      '*',
    );
  }

  if (message === 'setLocalStorageItem') {
    const erxesStorage = JSON.parse(localStorage.getItem('erxes') || '{}');

    erxesStorage[key] = value;

    localStorage.setItem('erxes', JSON.stringify(erxesStorage));
  }
};

export const getDomain = (subdomain: string) => {
  const defaultValue = 'http://localhost:4000';
  const VERSION = getEnv({ name: 'VERSION' });

  const baseDefault =
    VERSION === 'os' ? defaultValue : `http://${subdomain}.api.erxes.com`;

  const DOMAIN = getEnv({
    name: 'DOMAIN',
    subdomain,
    defaultValue: baseDefault,
  });

  return DOMAIN.replace('<subdomain>', subdomain);
};
export const getEnv = ({
  name,
  defaultValue,
  subdomain,
}: {
  name: string;
  defaultValue?: string;
  subdomain?: string;
}): string => {
  let value = process.env[name] || '';

  if (!value && defaultValue !== undefined) {
    return defaultValue;
  }

  if (subdomain) {
    value = value.replace('<subdomain>', subdomain);
  }

  return value || '';
};
