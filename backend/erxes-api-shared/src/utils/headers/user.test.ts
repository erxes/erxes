import { IncomingHttpHeaders } from 'http';
import { IDENTITY_HEADER_TTL_MS } from './signed';
import {
  compactUserForHeader,
  extractClientPortalFromHeader,
  extractCPUserFromHeader,
  extractUserFromHeader,
  setCPUserHeader,
  setUserHeader,
  USER_HEADER_OMITTED_FIELDS,
} from './user';

const SECRET = 'test-identity-secret';

beforeEach(() => {
  process.env.JWT_TOKEN_SECRET = SECRET;
  delete process.env.VERSION;
});

afterEach(() => {
  jest.useRealTimers();
});

describe('user header', () => {
  const user = {
    _id: 'u1',
    email: 'mj@example.com',
    isOwner: true,
    groupIds: ['g1'],
    oauthScopes: ['sales-deal:manage', 'contacts:read'],
    emailSignatures: [{ brandId: 'b1', signature: 'x'.repeat(4000) }],
    customFieldsData: [{ field: 'f1', value: 'y'.repeat(3000) }],
    propertiesData: [{ field: 'f2', value: 'z' }],
    links: { website: 'https://example.com' },
    loginToken: 'jwt.'.repeat(200),
  };

  it('forwards identity, permissions and oauth scopes but not profile bulk', () => {
    const headers: IncomingHttpHeaders = {};
    setUserHeader(headers, user, 'acme');
    const forwarded = extractUserFromHeader(headers);

    expect(forwarded._id).toBe('u1');
    expect(forwarded.isOwner).toBe(true);
    expect(forwarded.groupIds).toEqual(['g1']);
    expect(forwarded.oauthScopes).toEqual([
      'sales-deal:manage',
      'contacts:read',
    ]);
    expect(headers.userid).toBeUndefined();

    for (const field of USER_HEADER_OMITTED_FIELDS) {
      expect(forwarded).not.toHaveProperty(field);
    }
  });

  it('keeps the header well under the default 16 KB request-header limit', () => {
    const headers: IncomingHttpHeaders = {};
    setUserHeader(
      headers,
      {
        ...user,
        oauthScopes: Array.from(
          { length: 120 },
          (_, i) => `plugin-module${i}:manage`,
        ),
      },
      'acme',
    );

    expect(String(headers.user).length).toBeLessThan(8 * 1024);
  });

  it('warns before a header outgrows the service budget', () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const headers: IncomingHttpHeaders = {};

    setUserHeader(
      headers,
      { ...user, departmentIds: Array(4000).fill('d'.repeat(10)) },
      'acme',
    );

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('u1');
    warn.mockRestore();
  });

  it("does not mutate the caller's user object", () => {
    const copy = { ...user };
    compactUserForHeader(copy);
    expect(copy.emailSignatures).toBeDefined();
  });
});

describe('identity header trust', () => {
  const owner = { _id: 'owner', isOwner: true };
  const base64 = (value: unknown) =>
    Buffer.from(JSON.stringify(value), 'utf8').toString('base64');

  it('treats a forged unsigned user header as anonymous', () => {
    expect(extractUserFromHeader({ user: base64(owner) })).toBeNull();
    expect(extractCPUserFromHeader({ cpuser: base64(owner) })).toBeNull();
    expect(
      extractClientPortalFromHeader({ clientportal: base64({ _id: 'cp' }) }),
    ).toBeNull();
  });

  it('rejects a signed header whose identity was edited', () => {
    const headers: IncomingHttpHeaders = {};
    setUserHeader(headers, { _id: 'u1', isOwner: false }, 'acme');

    const [payload, signature] = String(headers.user).split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    decoded.value.isOwner = true;
    const tampered = Buffer.from(JSON.stringify(decoded)).toString('base64url');

    expect(
      extractUserFromHeader({ user: `${tampered}.${signature}` }),
    ).toBeNull();
  });

  it('rejects a client portal user header replayed as a staff user', () => {
    const headers: IncomingHttpHeaders = {};
    setCPUserHeader(headers, { _id: 'cp-user' }, 'acme');

    expect(extractUserFromHeader({ user: headers.cpuser })).toBeNull();
  });

  it('rejects a header signed with a different secret', () => {
    const headers: IncomingHttpHeaders = {};
    setUserHeader(headers, owner, 'acme');

    process.env.JWT_TOKEN_SECRET = 'other-secret';

    expect(extractUserFromHeader(headers)).toBeNull();
  });

  it('rejects an expired header', () => {
    jest.useFakeTimers();
    const headers: IncomingHttpHeaders = {};
    setUserHeader(headers, owner, 'acme');

    jest.advanceTimersByTime(IDENTITY_HEADER_TTL_MS + 1000);

    expect(extractUserFromHeader(headers)).toBeNull();
  });

  it('refuses to sign or trust headers without a secret', () => {
    const headers: IncomingHttpHeaders = {};
    setUserHeader(headers, owner, 'acme');
    delete process.env.JWT_TOKEN_SECRET;

    expect(extractUserFromHeader(headers)).toBeNull();
    expect(() => setUserHeader({}, owner, 'acme')).toThrow('JWT_TOKEN_SECRET');
  });

  it('on SaaS, only trusts a header on the tenant it was issued for', () => {
    process.env.VERSION = 'saas';
    const headers: IncomingHttpHeaders = {};
    setUserHeader(headers, owner, 'acme');

    expect(
      extractUserFromHeader({
        ...headers,
        'nginx-hostname': 'acme.erxes.io',
      })?._id,
    ).toBe('owner');
    expect(
      extractUserFromHeader({
        ...headers,
        'nginx-hostname': 'victim.erxes.io',
      }),
    ).toBeNull();
  });
});
