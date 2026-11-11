import { readProcessEnvironment } from './readProcessEnvironment';

declare global {
  interface Window {
    env?: Record<string, string>;
    __APOLLO_CLIENT__?: any;
  }
}

const browserEnvironment =
  typeof window === 'undefined' ? undefined : window.env;
const NODE_ENV =
  readProcessEnvironment(() => process.env.NODE_ENV) || 'development';

const getDefaultUrl = () => {
  if (NODE_ENV === 'development') {
    return 'http://localhost:4000';
  }
  return typeof window === 'undefined'
    ? '/gateway'
    : `${window.location.protocol}//${window.location.hostname}/gateway`;
};

const getSubdomain = () => {
  return typeof window === 'undefined'
    ? ''
    : window.location.hostname.split('.')[0];
};

const getApi = (): string => {
  const envApiUrl =
    browserEnvironment?.REACT_APP_API_URL ??
    (readProcessEnvironment(() => process.env.REACT_APP_API_URL) ||
      getDefaultUrl());

  return envApiUrl.includes('<subdomain>')
    ? envApiUrl.replace('<subdomain>', getSubdomain())
    : envApiUrl;
};

const cdnUrl = () => {
  return (
    browserEnvironment?.REACT_APP_IMAGE_CDN_URL ??
    readProcessEnvironment(() => process.env.REACT_APP_IMAGE_CDN_URL)
  );
};

const googleMapApiKey = () => {
  return (
    browserEnvironment?.REACT_APP_GOOGLE_MAP_API_KEY ??
    readProcessEnvironment(() => process.env.REACT_APP_GOOGLE_MAP_API_KEY)
  );
};

const hideCoreModules = () => {
  return (
    browserEnvironment?.REACT_APP_HIDE_CORE_MODULES ??
    readProcessEnvironment(() => process.env.REACT_APP_HIDE_CORE_MODULES)
  );
};

const sentryDsn = () => {
  return (
    browserEnvironment?.REACT_APP_SENTRY_DSN ??
    readProcessEnvironment(() => process.env.REACT_APP_SENTRY_DSN)
  );
};

const sentryEnvironment = () => {
  return (
    browserEnvironment?.REACT_APP_SENTRY_ENVIRONMENT ??
    readProcessEnvironment(() => process.env.REACT_APP_SENTRY_ENVIRONMENT)
  );
};

const REACT_APP_API_URL = getApi();
const REACT_APP_IMAGE_CDN_URL = cdnUrl();
const REACT_APP_GOOGLE_MAP_API_KEY = googleMapApiKey();
const REACT_APP_HIDE_CORE_MODULES = hideCoreModules();
const REACT_APP_SENTRY_DSN = sentryDsn();
const REACT_APP_SENTRY_ENVIRONMENT = sentryEnvironment();

export {
  NODE_ENV,
  REACT_APP_API_URL,
  REACT_APP_IMAGE_CDN_URL,
  REACT_APP_GOOGLE_MAP_API_KEY,
  REACT_APP_HIDE_CORE_MODULES,
  REACT_APP_SENTRY_DSN,
  REACT_APP_SENTRY_ENVIRONMENT,
};
