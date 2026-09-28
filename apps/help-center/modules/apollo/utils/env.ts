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

export const apiUrlForHost = (host?: string): string => {
  const configured = configuredApiUrl();

  if (!isSaas() || !configured.includes(SUBDOMAIN_PLACEHOLDER)) {
    return configured;
  }

  const from =
    host ?? (typeof window !== 'undefined' ? window.location.hostname : '');

  const subdomain = subdomainOf(from);

  if (!subdomain) {
    return '';
  }

  return configured.replaceAll(SUBDOMAIN_PLACEHOLDER, subdomain);
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
