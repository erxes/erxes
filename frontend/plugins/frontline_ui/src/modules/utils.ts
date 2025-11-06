declare global {
  interface Window {
    env?: Record<string, string>;
    __APOLLO_CLIENT__?: any;
  }
}

const getDefaultUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:4000';
  } else {
    return `${window.location.protocol}//${window.location.hostname}/gateway`;
  }
};

const getSubdomain = () => {
  return window.location.hostname.split('.')[0];
};

let memoizedApiUrl: string | null = null;

const getWidgetUrl = (): string => {
  // if (memoizedApiUrl) return memoizedApiUrl;

  const envApiUrl =
    window.env?.REACT_APP_WIDGET_URL ??
    (process.env.REACT_APP_WIDGET_URL || getDefaultUrl());

  memoizedApiUrl = envApiUrl?.includes('<subdomain>')
    ? envApiUrl.replace('<subdomain>', getSubdomain())
    : envApiUrl;

  return memoizedApiUrl;
};

const REACT_APP_WIDGET_URL = getWidgetUrl();

export { REACT_APP_WIDGET_URL };
