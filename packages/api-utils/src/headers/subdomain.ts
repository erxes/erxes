import { IncomingMessage } from 'http';
import getHostname from './get-hostname';

export const erxesSubdomainHeaderName = 'erxes-subdomain';

export const getSubdomain = (req: IncomingMessage): string => {
  let hostname = req.headers['nginx-hostname'] || getHostname(req);
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

export const getSubomdainHeader = (
  req: IncomingMessage,
): string | undefined => {
  const subdomainHeader = req.headers[erxesSubdomainHeaderName];
  if (Array.isArray(subdomainHeader)) {
    throw new Error(`Multiple ${erxesSubdomainHeaderName} headers!`);
  }
  return subdomainHeader;
};
