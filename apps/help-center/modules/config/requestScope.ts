import { cache } from 'react';

/*
 * The gateway address and the portal's app token are resolved from the host of
 * the request being answered, so on a SaaS install they differ between
 * tenants. `cache()` gives each request its own store, which keeps a value
 * written while answering one request from being read while answering another
 * — the hazard module-level variables carry once anything between the write
 * and the read suspends.
 *
 * These are only ever written from server code, which is where the request
 * host is known.
 */
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
