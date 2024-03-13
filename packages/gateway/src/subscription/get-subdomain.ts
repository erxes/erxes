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

  const host = nginxHostname || headers.host;

  if (!host) {
    console.error('getSubdomain: Unable to find hostname');
    throw new Error('getSubdomain: Unable to find hostname');
  }

  // 1. remove http:// etc,
  // 2. remove from last : character to EOL
  const hostname = host
    .replace(/(^\w+:|^)\/\//, '')
    .replace(/:(?!.*?:)\d+$/, '');

  const subdomain = (!isIP(hostname) ? hostname.split('.') : [hostname])[0];

  return subdomain;
}
