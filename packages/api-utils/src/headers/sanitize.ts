import { IncomingHttpHeaders } from 'http';
import { userHeaderName } from './user';

export function sanitizeHeaders(headers: IncomingHttpHeaders) {
  delete headers[userHeaderName];
}
