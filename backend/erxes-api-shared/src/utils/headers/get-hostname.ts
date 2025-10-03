import { IncomingMessage } from 'http';

type HostnameGetter = (req: IncomingMessage) => string | undefined;

// trimmed version of getHostname, since we don't enable trust
export const getHostnameZeroTrust: HostnameGetter = (
  req: IncomingMessage,
): string | undefined => {
  const host = req.headers.host;

  if (!host) return;

  // IPv6 literal support
  const offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
  const index = host.indexOf(':', offset);

  return index !== -1 ? host.substring(0, index) : host;
};
