import { getEnv } from 'erxes-api-shared/utils';

export const isCallProEnabled = (): boolean =>
  (process.env.CALLPRO_ENABLED || '').toLowerCase() === 'true';

export const getCallProWebhookUrl = (subdomain: string): string => {
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  const domain =
    process.env.NODE_ENV === 'production'
      ? `${DOMAIN}/gateway/pl:frontline`
      : `${DOMAIN}/pl:frontline`;

  return `${domain}/callpro/receive`;
};
