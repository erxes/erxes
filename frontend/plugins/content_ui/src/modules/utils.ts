const getDefaultUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3400';
  } else {
    return 'https://<subdomain>.webbuilder.erxes.io';
  }
};

const getSubdomain = () => {
  return window.location.hostname.split('.')[0];
};

let memoizedApiUrl: string | null = null;

const getWebBuilderUrl = (): string => {
  // if (memoizedApiUrl) return memoizedApiUrl;

  const envApiUrl =
    window.env?.REACT_APP_WEBBUILDER_URL ??
    (process.env.REACT_APP_WEBBUILDER_URL || getDefaultUrl());

  memoizedApiUrl = envApiUrl?.includes('<subdomain>')
    ? envApiUrl.replace('<subdomain>', getSubdomain())
    : envApiUrl;

  return memoizedApiUrl;
};

const REACT_APP_WEBBUILDER_URL = getWebBuilderUrl();

export { REACT_APP_WEBBUILDER_URL };
