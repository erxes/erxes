/*
 * The gateway address is read at run time, not baked into the bundle, so one
 * image can serve any number of deployments. `docker-entrypoint.sh` writes
 * public/js/env.js from the container's environment before the server starts,
 * and the root layout loads that file ahead of the app.
 *
 * On a SaaS install the gateway is addressed per tenant, so
 * `NEXT_PUBLIC_APP_VERSION=SAAS` turns on substitution of a `<subdomain>`
 * placeholder in the address. It is filled from the host the request arrived
 * on: `window.location` in the browser, and on the server the host the config
 * layer reads from the request headers. This is the same switch
 * apps/posclient-front uses.
 */
declare global {
  interface Window {
    env?: Record<string, string | undefined>;
  }
}

export const SUBDOMAIN_PLACEHOLDER = '<subdomain>';

export const subdomainOf = (host: string): string =>
  host
    .replace(/^\w+:\/\//, '')
    .split(':')[0]
    .split('.')[0];

/*
 * Outside Docker there is no env.js — `next dev` and `next start` read the
 * values from .env.local like any other Next app, which is what `inlined`
 * carries.
 *
 * Those reads are spelled out at each call site rather than indexed here:
 * Next replaces each `process.env.NEXT_PUBLIC_*` member textually while
 * bundling, and a dynamic lookup would be left as-is and read nothing in the
 * browser.
 */
const runtimeEnv = (name: string, inlined: string | undefined): string =>
  (typeof window !== 'undefined' ? window.env?.[name] : undefined) ??
  inlined ??
  '';

const configuredApiUrl = (): string =>
  runtimeEnv(
    'NEXT_PUBLIC_ERXES_API_URL',
    process.env.NEXT_PUBLIC_ERXES_API_URL,
  );

const isSaas = (): boolean =>
  runtimeEnv(
    'NEXT_PUBLIC_APP_VERSION',
    process.env.NEXT_PUBLIC_APP_VERSION,
  ).toUpperCase() === 'SAAS';

/**
 * The gateway address for a given host. Server code passes the host of the
 * request it is answering; in the browser the current location is used.
 */
export const apiUrlForHost = (host?: string): string => {
  const configured = configuredApiUrl();

  if (!isSaas() || !configured.includes(SUBDOMAIN_PLACEHOLDER)) {
    return configured;
  }

  const from =
    host ?? (typeof window !== 'undefined' ? window.location.hostname : '');

  const subdomain = subdomainOf(from);

  // Without a host there is nothing to substitute, and an address still
  // carrying the placeholder would be a confusing request to debug.
  if (!subdomain) {
    return '';
  }

  return configured.replaceAll(SUBDOMAIN_PLACEHOLDER, subdomain);
};

/*
 * Server code resolves the address from the host of the request it is
 * answering and publishes it here, so the helpers and components that read
 * the address without one — file URLs, rich text images — get the same
 * answer. In the browser there is no reader and the current location is used.
 */
let resolved: () => string = () => '';

export const setResolvedApiUrlReader = (reader: () => string): void => {
  resolved = reader;
};

export const readApiUrl = (): string => {
  if (typeof window === 'undefined') {
    const fromRequest = resolved();

    if (fromRequest) {
      return fromRequest;
    }
  }

  return apiUrlForHost();
};
