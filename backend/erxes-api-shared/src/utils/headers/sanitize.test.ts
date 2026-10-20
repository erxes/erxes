import { IncomingHttpHeaders } from 'http';
import { sanitizeHeaders } from './sanitize';
import {
  extractClientPortalFromHeader,
  extractCPUserFromHeader,
  extractUserFromHeader,
  setUserHeader,
} from './user';

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value), 'utf8').toString('base64');

describe('sanitizeHeaders', () => {
  it('drops client-supplied identity headers so they cannot be forwarded', () => {
    const headers: IncomingHttpHeaders = {
      user: encode({ _id: 'forged', isOwner: true }),
      userid: 'forged',
      cpuser: encode({ _id: 'forged-cp-user' }),
      clientportal: encode({ _id: 'forged-portal' }),
      'erxes-subdomain': 'other-tenant',
      authorization: 'Bearer token',
      'content-type': 'application/json',
    };

    sanitizeHeaders(headers);

    expect(extractUserFromHeader(headers)).toBeNull();
    expect(extractCPUserFromHeader(headers)).toBeNull();
    expect(extractClientPortalFromHeader(headers)).toBeNull();
    expect(headers.userid).toBeUndefined();
    expect(headers['erxes-subdomain']).toBeUndefined();
    expect(headers.authorization).toBe('Bearer token');
    expect(headers['content-type']).toBe('application/json');
  });

  it('leaves a header set by the gateway after sanitizing intact', () => {
    const headers: IncomingHttpHeaders = { user: encode({ _id: 'forged' }) };

    sanitizeHeaders(headers);
    setUserHeader(headers, { _id: 'verified' });

    expect(extractUserFromHeader(headers)._id).toBe('verified');
    expect(headers.userid).toBe('verified');
  });
});
