import { cache } from 'react';

type RequestScope = {
  apiUrl: string;
  appToken: string;
};

const requestScope = cache((): RequestScope => ({ apiUrl: '', appToken: '' }));

export const readScopedApiUrl = (): string => requestScope().apiUrl;

export const writeScopedApiUrl = (apiUrl: string): void => {
  requestScope().apiUrl = apiUrl;
};

export const readScopedAppToken = (): string => requestScope().appToken;

export const writeScopedAppToken = (appToken: string): void => {
  requestScope().appToken = appToken;
};
