import { ENV } from './types';

export const getEnv = (): ENV => {
  return (window as any).erxesEnv;
};

export const getStorage = () => {
  return localStorage.getItem("erxes") || "{}";
}

export const listenForCommonRequests = async (event: any, iframe: any) => {
  const { message, fromErxes, source, key, value } = event.data;
  
  if (fromErxes && iframe.contentWindow) {
    if (message === "requestingBrowserInfo") {
      iframe.contentWindow.postMessage(
        {
          fromPublisher: true,
          source,
          message: "sendingBrowserInfo",
          browserInfo: await getBrowserInfo()
        },
        "*"
      );
    }

    if (message === "setLocalStorageItem") {
      const erxesStorage = JSON.parse(localStorage.getItem("erxes") || "{}");

      erxesStorage[key] = value;

      localStorage.setItem("erxes", JSON.stringify(erxesStorage));
    }
  }
}

declare const window: any;

/*
 * Generate <host>/<integration kind> from <host>/<integration kind>Widget.bundle.js
 */
export const generateIntegrationUrl = (integrationKind: string): string => {
  const script =
    document.currentScript ||
    (() => {
      const scripts = document.getElementsByTagName('script');

      return scripts[scripts.length - 1];
    })();

  if (script && script instanceof HTMLScriptElement) {
    return script.src.replace(
      `/build/${integrationKind}Widget.bundle.js`,
      `/${integrationKind}`
    );
  }

  return '';
};

export const getBrowserInfo = async () => {
  if (window.location.hostname === 'localhost') {
    return {
      url: window.location.pathname,
      hostname: window.location.origin,
      language: navigator.language,
      userAgent: navigator.userAgent
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
      countryCode: ''
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
    userAgent: navigator.userAgent
  };
};

export const postMessage = (source: string, message: string, postData = {}) => {
  window.parent.postMessage(
    {
      fromErxes: true,
      source,
      message,
      ...postData
    },
    '*'
  );
};

export const setErxesProperty = (name: string, value: any) => {
  const erxes = window.Erxes || {};

  erxes[name] = value;

  window.Erxes = erxes;
};
