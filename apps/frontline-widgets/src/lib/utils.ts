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
      remoteAddress: '',
      region: '',
      countryCode: '',
      city: '',
      country: '',
      url: window.location.href,
      hostname: window.location.hostname,
      language: navigator.language,
      userAgent: navigator.userAgent,
    });
  }, 2000);
};

export const getSubdomain = (): string => {
  const hostnameParts = window.location.hostname.split('.');

  if (hostnameParts.length > 2) {
    return hostnameParts[0];
  }

  // return an empty string (for open-source environments with no subdomain)
  return '';
};

export const getEnv = () => {
  const wenv = (window as any).erxesEnv || {};

  const subdomain = getSubdomain();

  const getItem = (name: string) => {
    const value = wenv[name] || process.env[name] || '';
    // Only replace '<subdomain>' if it exists in the value
    if (value.includes('<subdomain>')) {
      return value.replace('<subdomain>', subdomain);
    }

    return value;
  };

  return {
    API_URL: getItem('API_URL'),
    API_SUBSCRIPTIONS_URL: getItem('API_SUBSCRIPTIONS_URL'),
    // CALLS_APP_ID: getItem('CALLS_APP_ID'),
    // CALLS_APP_SECRET: getItem('CALLS_APP_SECRET'),
  };
};
