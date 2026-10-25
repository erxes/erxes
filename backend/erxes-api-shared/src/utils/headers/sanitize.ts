import { IncomingHttpHeaders } from 'http';
import {
  clientPortalHeaderName,
  cpUserHeaderName,
  identitySignatureHeaderName,
  userHeaderName,
  userIdHeaderName,
} from './names';
import { erxesSubdomainHeaderName } from './subdomain';

// Identity headers services trust. Any of them arriving on an external
// request is spoofed, so the gateway strips them (and any client-supplied
// signature) before minting its own.
export function sanitizeHeaders(headers: IncomingHttpHeaders) {
  delete headers[erxesSubdomainHeaderName];
  delete headers[userHeaderName];
  delete headers[userIdHeaderName];
  delete headers[cpUserHeaderName];
  delete headers[clientPortalHeaderName];
  delete headers[identitySignatureHeaderName];
}
