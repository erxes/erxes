import { IncomingMessage } from 'http';

export const erxesSubdomainHeaderName = 'erxes-subdomain';

export const getSubdomainHeader = (req: IncomingMessage): string => {
  const subdomainHeader = req.headers[erxesSubdomainHeaderName];
  if (Array.isArray(subdomainHeader)) {
    throw new Error(`Multiple ${erxesSubdomainHeaderName} headers!`);
  }
  if (!subdomainHeader) {
    throw new Error(`${erxesSubdomainHeaderName} header not found`);
  }
  return subdomainHeader;
};
