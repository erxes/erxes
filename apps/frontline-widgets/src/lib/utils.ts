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
