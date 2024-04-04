import { IncomingMessage } from 'http';

// we don't enable trust
function trust(..._args: any[]) {
  return false;
}

type HostnameGetter = (req: IncomingMessage) => string | undefined;

// this is supposed behave as same as express's req.hostname
const getHostname: HostnameGetter = (
  req: IncomingMessage,
): string | undefined => {
  let host = req.headers['X-Forwarded-Host'];

  if (Array.isArray(host)) {
    host = host[0];
  }

  if (!host || !trust(req.socket.remoteAddress, 0)) {
    host = req.headers.host;
  } else if (host.indexOf(',') !== -1) {
    // Note: X-Forwarded-Host is normally only ever a
    //       single value, but this is to be safe.
    host = host.substring(0, host.indexOf(',')).trimEnd();
  }

  if (!host) return;

  // IPv6 literal support
  const offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
  const index = host.indexOf(':', offset);

  return index !== -1 ? host.substring(0, index) : host;
};

// trimmed version of getHostname, since we don't enable trust
const getHostnameZeroTrust: HostnameGetter = (
  req: IncomingMessage,
): string | undefined => {
  const host = req.headers.host;

  if (!host) return;

  // IPv6 literal support
  const offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
  const index = host.indexOf(':', offset);

  return index !== -1 ? host.substring(0, index) : host;
};

export default getHostnameZeroTrust;
