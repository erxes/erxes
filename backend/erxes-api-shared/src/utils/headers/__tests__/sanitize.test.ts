import { IncomingHttpHeaders } from 'http';
import { sanitizeHeaders } from '../sanitize';
import {
  extractClientPortalFromHeader,
  extractCPUserFromHeader,
  extractUserFromHeader,
  setClientPortalHeader,
  setCPUserHeader,
  setUserHeader,
} from '../user';

describe('sanitizeHeaders', () => {
  it.each(['forged', ['forged', 'duplicate']])(
    'removes every inbound identity header with value %j',
    (value) => {
      const headers: IncomingHttpHeaders = {
        user: value,
        userid: value,
        cpuser: value,
        clientportal: value,
        'erxes-subdomain': value,
      };

      sanitizeHeaders(headers);

      expect(headers).toEqual({});
    },
  );

  it('preserves credentials, routing and application headers', () => {
    const headers: IncomingHttpHeaders = {
      authorization: 'Bearer token',
      cookie: 'auth-token=token',
      host: 'tenant.example.com',
      'content-type': 'application/json',
      'erxes-app-token': 'app-token',
      'x-app-token': 'portal-token',
      'client-auth-token': 'portal-user-token',
      sessioncode: 'session',
    };
    const original = { ...headers };

    sanitizeHeaders(headers);
    sanitizeHeaders(headers);

    expect(headers).toEqual(original);
  });

  it('allows the gateway to mint verified identities after sanitizing', () => {
    const headers: IncomingHttpHeaders = { user: 'forged', cpuser: 'forged' };
    const user = { _id: 'verified-user', isOwner: false };
    const cpUser = { _id: 'verified-portal-user' };
    const clientPortal = { _id: 'verified-portal' };

    sanitizeHeaders(headers);
    setUserHeader(headers, user);
    setCPUserHeader(headers, cpUser);
    setClientPortalHeader(headers, clientPortal);

    expect(extractUserFromHeader(headers)).toEqual(user);
    expect(headers.userid).toBe(user._id);
    expect(extractCPUserFromHeader(headers)).toEqual(cpUser);
    expect(extractClientPortalFromHeader(headers)).toEqual(clientPortal);
  });
});
