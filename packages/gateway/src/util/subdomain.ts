import { erxesSubdomainHeaderName } from '@erxes/api-utils/src/headers';
import getHostnameZeroTrust from '@erxes/api-utils/src/headers/get-hostname';
import { IncomingMessage } from 'http';

export const getSubdomain = (req: IncomingMessage): string => {
  let hostname = req.headers['nginx-hostname'] || getHostnameZeroTrust(req);
  if (!hostname) {
    throw new Error('Hostname not found');
  }
  if (Array.isArray(hostname)) {
    hostname = hostname[0];
  }
  const subdomain = hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
  return subdomain;
};

export const setSubdomainHeader = (req: IncomingMessage): void => {
  const subdomain = getSubdomain(req);
  req.headers[erxesSubdomainHeaderName] = subdomain;
};
