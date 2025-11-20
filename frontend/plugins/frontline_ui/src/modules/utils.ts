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
  console.log(
    process.env.REACT_APP_WIDGETS_URL,
    'process.env.REACT_APP_WIDGETS_URL',
  );
  const envApiUrl =
    window.env?.REACT_APP_WIDGETS_URL ??
    (process.env.REACT_APP_WIDGETS_URL || getDefaultUrl());
  console.log(envApiUrl, 'envApiUrl');
  memoizedApiUrl = envApiUrl?.includes('<subdomain>')
    ? envApiUrl.replace('<subdomain>', getSubdomain())
    : envApiUrl;
  console.log(memoizedApiUrl, 'memoizedApiUrl');
  return memoizedApiUrl;
};

const REACT_APP_WIDGETS_URL = getWidgetUrl();

export { REACT_APP_WIDGETS_URL };
