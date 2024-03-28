import { IncomingHttpHeaders } from 'http';
import { userHeaderName } from './user';
import { erxesSubdomainHeaderName } from './subdomain';

export function sanitizeHeaders(headers: IncomingHttpHeaders) {
  delete headers[erxesSubdomainHeaderName];
  delete headers[userHeaderName];
  delete headers['userid'];
}
