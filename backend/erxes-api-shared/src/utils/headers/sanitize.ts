import { IncomingHttpHeaders } from 'http';
import {
  clientPortalHeaderName,
  cpUserHeaderName,
  userHeaderName,
} from './user';
import { erxesSubdomainHeaderName } from './subdomain';

/**
 * Removes every identity header a client could send. Only the gateway may set
 * these, after verifying a token, so incoming copies must never be trusted.
 */
export function sanitizeHeaders(headers: IncomingHttpHeaders) {
  delete headers[erxesSubdomainHeaderName];
  delete headers[userHeaderName];
  delete headers['userid'];
  delete headers[cpUserHeaderName];
  delete headers[clientPortalHeaderName];
}
