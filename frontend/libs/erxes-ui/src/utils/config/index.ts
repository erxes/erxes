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

const getApi = (): string => {
  // if (memoizedApiUrl) return memoizedApiUrl;

  const envApiUrl =
    window.env?.REACT_APP_API_URL ??
    (process.env.REACT_APP_API_URL || getDefaultUrl());

  memoizedApiUrl = envApiUrl?.includes('<subdomain>')
    ? envApiUrl.replace('<subdomain>', getSubdomain())
    : envApiUrl;

  return memoizedApiUrl;
};

const cdnUrl = () => {
  return (
    window.env?.REACT_APP_IMAGE_CDN_URL ?? process.env.REACT_APP_IMAGE_CDN_URL
  );
};

const NODE_ENV = process.env.NODE_ENV || 'development';
const REACT_APP_API_URL = getApi();
const REACT_APP_IMAGE_CDN_URL = cdnUrl();

export { NODE_ENV, REACT_APP_API_URL, REACT_APP_IMAGE_CDN_URL };
