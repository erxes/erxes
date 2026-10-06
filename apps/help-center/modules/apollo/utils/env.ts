declare global {
  interface Window {
    env?: Record<string, string | undefined>;
    // Set by the root layout when the page is served on a tenant's own
    // domain, whose first label is not the tenant subdomain.
    erxesSubdomain?: string;
  }
}

export const SUBDOMAIN_PLACEHOLDER = '<subdomain>';

export const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const subdomainOf = (host: string): string =>
  host
    .replace(/^\w+:\/\//, '')
    .split(':')[0]
    .split('.')[0];

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

export const apiUrlForSubdomain = (subdomain: string): string => {
  const configured = configuredApiUrl();

  if (!isSaas() || !configured.includes(SUBDOMAIN_PLACEHOLDER)) {
    return configured;
  }

  if (!subdomain) {
    return '';
  }

  return configured.replaceAll(SUBDOMAIN_PLACEHOLDER, subdomain);
};

export const apiUrlForHost = (host?: string): string => {
  if (host === undefined && typeof window !== 'undefined') {
    return apiUrlForSubdomain(
      window.erxesSubdomain || subdomainOf(window.location.hostname),
    );
  }

  return apiUrlForSubdomain(subdomainOf(host ?? ''));
};

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
