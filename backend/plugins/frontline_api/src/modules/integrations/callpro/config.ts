import { getEnv } from 'erxes-api-shared/utils';

export const isCallProInstalled = (): boolean =>
  (process.env.CALLPRO_ENABLED || '').toLowerCase() === 'true';

const getCallProSubdomains = (): string[] =>
  (process.env.CALLPRO_SUBDOMAINS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

export const isCallProEnabled = (subdomain: string): boolean => {
  if (!isCallProInstalled()) {
    return false;
  }

  const subdomains = getCallProSubdomains();

  return (
    !subdomains.length || subdomains.includes((subdomain || '').toLowerCase())
  );
};

export const getCallProWebhookUrl = (subdomain: string): string => {
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  const domain =
    process.env.NODE_ENV === 'production'
      ? `${DOMAIN}/gateway/pl:frontline`
      : `${DOMAIN}/pl:frontline`;

  return `${domain}/callpro/receive`;
};
