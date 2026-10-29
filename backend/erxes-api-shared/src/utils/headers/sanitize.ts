import { IncomingHttpHeaders } from 'http';
import {
  clientPortalHeaderName,
  cpUserHeaderName,
  userHeaderName,
} from './user';
import { erxesSubdomainHeaderName } from './subdomain';

// Identity headers arriving on an external request are spoofed, so the
// gateway strips them before forwarding; services also verify signatures.
export function sanitizeHeaders(headers: IncomingHttpHeaders) {
  delete headers[erxesSubdomainHeaderName];
  delete headers[userHeaderName];
  delete headers['userid'];
  delete headers[cpUserHeaderName];
  delete headers[clientPortalHeaderName];
}
