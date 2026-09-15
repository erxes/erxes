import { getEnv } from 'erxes-api-shared/utils';
import { normalizeViberMediaHostnames } from './utils/mediaHostnames';

export const getViberWebhookUrl = (
  subdomain: string,
  integrationId: string,
): string => {
  if (!subdomain.trim()) {
    throw new Error('Subdomain is required');
  }

  if (
    !integrationId.trim() ||
    integrationId === '.' ||
    integrationId === '..'
  ) {
    throw new Error('Invalid integration id');
  }

  const configuredUrl = getEnv({
    name: 'VIBER_RECEIVE_URL',
    subdomain,
  });

  const domain = getEnv({ name: 'DOMAIN', subdomain });

  if (!configuredUrl && !domain) {
    throw new Error('Viber webhook URL is not configured');
  }

  const pluginPath =
    process.env.NODE_ENV === 'production'
      ? '/gateway/pl:frontline'
      : '/pl:frontline';

  const receiverUrl =
    configuredUrl || `${domain.replace(/\/+$/, '')}${pluginPath}/viber/receive`;

  let url: URL;

  try {
    url = new URL(receiverUrl);
  } catch {
    throw new Error('Invalid Viber receive URL');
  }

  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error('Invalid Viber receive URL');
  }

  url.pathname = `${url.pathname.replace(/\/+$/, '')}/${encodeURIComponent(
    integrationId,
  )}`;

  return url.toString();
};

export const getViberMediaAllowedHostnames = (
  subdomain: string,
): readonly string[] => {
  if (!subdomain.trim()) {
    throw new Error('Subdomain is required');
  }

  const configuredHosts = getEnv({
    name: 'VIBER_MEDIA_ALLOWED_HOSTNAMES',
    subdomain,
  });

  const hostnames = configuredHosts
    .split(',')
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);

  try {
    return normalizeViberMediaHostnames(hostnames);
  } catch {
    throw new Error('Invalid Viber media hostname configuration');
  }
};
