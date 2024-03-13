import { isIP } from 'net';
import type { IncomingHttpHeaders } from 'http';

export default function getSubdomain(headers: IncomingHttpHeaders): string {
  const nginxHostnameHeader = headers['nginx-hostname'];

  let nginxHostname: string | undefined;

  if (nginxHostnameHeader) {
    if (Array.isArray(nginxHostnameHeader)) {
      nginxHostname = nginxHostnameHeader[0];
    } else {
      nginxHostname = nginxHostnameHeader;
    }
  }

  const hostname = nginxHostname || headers.host;

  if (!hostname) {
    console.error('getSubdomain: Unable to find hostname');
    throw new Error('getSubdomain: Unable to find hostname');
  }

  // remove from last : character to EOL
  const withoutPort = hostname.replace(/:(?!.*?:)\d+$/, '');

  const subdomain = (
    !isIP(withoutPort) ? withoutPort.split('.') : [withoutPort]
  )[0];

  return subdomain;
}
