import { IncomingHttpHeaders } from 'http';
import {
  clientPortalHeaderName,
  cpUserHeaderName,
  userHeaderName,
} from './user';
import { erxesSubdomainHeaderName } from './subdomain';

// Identity headers subgraphs trust verbatim. Any of them arriving on an
// external request is a spoofed identity, so the gateway strips all five
// before the router forwards the request.
export function sanitizeHeaders(headers: IncomingHttpHeaders) {
  delete headers[erxesSubdomainHeaderName];
  delete headers[userHeaderName];
  delete headers['userid'];
  delete headers[cpUserHeaderName];
  delete headers[clientPortalHeaderName];
}
