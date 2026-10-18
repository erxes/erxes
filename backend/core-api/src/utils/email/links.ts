import { getEnv } from 'erxes-api-shared/utils';

export const gatewayUrl = (subdomain?: string) => {
  const explicit = getEnv({ name: 'GATEWAY_URL', subdomain, defaultValue: '' });

  const domain = getEnv({ name: 'DOMAIN', subdomain });
  const fallback = domain
    ? `${domain}/gateway`
    : getEnv({
        name: 'REACT_APP_API_URL',
        subdomain,
        defaultValue: 'http://localhost:4000',
      });

  return (explicit || fallback).replace(/\/+$/, '');
};

export const coreUrl = (subdomain?: string) =>
  `${gatewayUrl(subdomain)}/pl:core`;

export const readFileUrl = (subdomain: string, key: string) =>
  `${gatewayUrl(subdomain)}/read-file?key=${encodeURIComponent(key)}`;

export const unsubscribeUrl = (
  subdomain: string,
  target: { cid?: string; uid?: string },
) => {
  const param = target.cid ? `cid=${target.cid}` : `uid=${target.uid}`;

  return `${coreUrl(subdomain)}/unsubscribe/?${param}`;
};

export const engageTrackerUrl = (subdomain?: string) =>
  `${coreUrl(subdomain)}/service/engage/tracker`;

export const senderConfirmUrl = (subdomain: string, token: string) =>
  `${coreUrl(subdomain)}/email-senders/confirm/?token=${token}`;
