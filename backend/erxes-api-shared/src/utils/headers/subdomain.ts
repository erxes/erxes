import { IncomingMessage } from 'http';

export const erxesSubdomainHeaderName = 'erxes-subdomain';

export const getSubomdainHeader = (
  req: IncomingMessage,
): string | undefined => {
  const subdomainHeader = req.headers[erxesSubdomainHeaderName];
  if (Array.isArray(subdomainHeader)) {
    throw new Error(`Multiple ${erxesSubdomainHeaderName} headers!`);
  }
  return subdomainHeader;
};
