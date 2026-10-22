import { getEnv } from 'erxes-api-shared/utils';

/** Public URL Meta downloads an outbound attachment from. */
export const generateWhatsappAttachmentUrl = (
  subdomain: string,
  urlOrName: string,
): string => {
  if (urlOrName.startsWith('http')) {
    return urlOrName;
  }

  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  if (getEnv({ name: 'NODE_ENV' }) === 'development') {
    return `${DOMAIN}/pl:core/read-file?key=${urlOrName}`;
  }

  return `${DOMAIN}/gateway/pl:core/read-file?key=${urlOrName}`;
};
