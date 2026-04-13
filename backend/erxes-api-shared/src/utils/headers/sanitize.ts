import { IncomingHttpHeaders } from 'http';
import {
  clientPortalHeaderName,
  cpUserHeaderName,
  userHeaderName,
} from './user';
import { erxesSubdomainHeaderName } from './subdomain';

export const internalAuthHeaderNames = [
  erxesSubdomainHeaderName,
  userHeaderName,
  clientPortalHeaderName,
  cpUserHeaderName,
  'userid',
] as const;

export function sanitizeHeaders(headers: IncomingHttpHeaders) {
  for (const headerName of internalAuthHeaderNames) {
    delete headers[headerName];
  }
}
