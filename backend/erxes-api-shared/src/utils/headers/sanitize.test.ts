import { IncomingHttpHeaders } from 'http';
import { sanitizeHeaders } from './sanitize';

describe('sanitizeHeaders', () => {
  it('removes every spoofable identity header', () => {
    const headers: IncomingHttpHeaders = {
      'erxes-subdomain': 'tenant',
      user: 'base64-user',
      userid: 'u1',
      cpuser: 'base64-cp-user',
      clientportal: 'base64-portal',
      'content-type': 'application/json',
    };

    sanitizeHeaders(headers);

    expect(headers).toEqual({ 'content-type': 'application/json' });
  });

  it('leaves a request without identity headers untouched', () => {
    const headers: IncomingHttpHeaders = {
      authorization: 'Bearer token',
      'nginx-hostname': 'os.example.com',
    };

    sanitizeHeaders(headers);

    expect(headers).toEqual({
      authorization: 'Bearer token',
      'nginx-hostname': 'os.example.com',
    });
  });
});
