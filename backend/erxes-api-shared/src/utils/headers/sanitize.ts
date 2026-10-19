import { IncomingHttpHeaders } from 'http';
import {
  clientPortalHeaderName,
  cpUserHeaderName,
  userHeaderName,
} from './user';
import { erxesSubdomainHeaderName } from './subdomain';

// Drops the identity headers services trust (user, client portal) and
// erxes-subdomain, so a client can't supply them. The gateway calls it before
// it authenticates the request.
export function sanitizeHeaders(headers: IncomingHttpHeaders) {
  delete headers[erxesSubdomainHeaderName];
  delete headers[userHeaderName];
  delete headers['userid'];
  delete headers[cpUserHeaderName];
  delete headers[clientPortalHeaderName];
}
