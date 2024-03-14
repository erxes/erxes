import { IncomingMessage } from 'http';

export default function getHostname(req: IncomingMessage) {
  const hostInQuestion = req.headers['X-Forwarded-Host'];

  if (!hostInQuestion) {
    throw new Error('Invalid host');
  }

  if (Array.isArray(hostInQuestion)) {
    throw new Error('Invalid host');
  }

  let host = hostInQuestion as string;

  if (!host) {
    if (typeof req.headers['Host'] !== 'string') {
      throw new Error('Invalid host');
    }
    host = req.headers['Host'];
  } else if (host.indexOf(',') !== -1) {
    // Note: X-Forwarded-Host is normally only ever a
    //       single value, but this is to be safe.
    host = host.substring(0, host.indexOf(',')).trimEnd();
  }

  if (!host) return;

  // IPv6 literal support
  var offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
  var index = host.indexOf(':', offset);

  return index !== -1 ? host.substring(0, index) : host;
}
