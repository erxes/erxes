import { cache } from 'react';

type RequestScope = {
  apiUrl: string;
  appToken: string;
  // Only set when the request came in on a tenant's own domain.
  customDomainSubdomain: string;
};

const requestScope = cache(
  (): RequestScope => ({ apiUrl: '', appToken: '', customDomainSubdomain: '' }),
);

export const readScopedApiUrl = (): string => requestScope().apiUrl;

export const writeScopedApiUrl = (apiUrl: string): void => {
  requestScope().apiUrl = apiUrl;
};

export const readScopedAppToken = (): string => requestScope().appToken;

export const writeScopedAppToken = (appToken: string): void => {
  requestScope().appToken = appToken;
};

export const readScopedCustomDomainSubdomain = (): string =>
  requestScope().customDomainSubdomain;

export const writeScopedCustomDomainSubdomain = (subdomain: string): void => {
  requestScope().customDomainSubdomain = subdomain;
};
