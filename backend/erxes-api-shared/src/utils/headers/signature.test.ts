import { IncomingHttpHeaders } from 'http';
import { identitySignatureHeaderName } from './names';
import {
  assertInternalHeaderSignatureConfig,
  createInternalHeaderSignature,
  dropUntrustedIdentityHeaders,
  getSubdomainFromHeaders,
  isIdentityHeaderTrusted,
  signIdentityHeaders,
  verifyIdentityHeaders,
} from './signature';
import {
  extractClientPortalFromHeader,
  extractCPUserFromHeader,
  extractUserFromHeader,
  setClientPortalHeader,
  setCPUserHeader,
  setUserHeader,
} from './user';
import {
  getTRPCContextHeaders,
  isTRPCContextHeaderTrusted,
  trpcContextHeaderName,
  trpcContextSignatureHeaderName,
} from '../trpc/context-header';

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value), 'utf8').toString('base64');

const owner = { _id: 'owner-1', email: 'owner@example.com', isOwner: true };

// Headers as the gateway forwards them: minted identity, tenant, signature.
const gatewayHeaders = (): IncomingHttpHeaders => {
  const headers: IncomingHttpHeaders = { hostname: 'tenant.example.com' };

  setUserHeader(headers, owner);
  setCPUserHeader(headers, { _id: 'cp-1' });
  setClientPortalHeader(headers, { _id: 'portal-1' });

  const signature = signIdentityHeaders(headers);

  if (signature) {
    headers[identitySignatureHeaderName] = signature;
  }

  return headers;
};

const spoofedHeaders = (): IncomingHttpHeaders => ({
  hostname: 'tenant.example.com',
  user: encode({ _id: 'spoofed-user' }),
  userid: 'spoofed-user',
  cpuser: encode({ _id: 'cp-x' }),
  clientportal: encode({ _id: 'portal-x' }),
});

describe('internal identity header signature', () => {
  const env = { ...process.env };
  let warn: jest.SpyInstance;

  beforeEach(() => {
    process.env.JWT_TOKEN_SECRET = 'test-secret';
    delete process.env.INTERNAL_HEADER_SIGNATURE;
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = { ...env };
    warn.mockRestore();
  });

  it('accepts identity headers signed by the gateway', () => {
    process.env.INTERNAL_HEADER_SIGNATURE = 'enforce';
    const headers = gatewayHeaders();

    expect(verifyIdentityHeaders(headers)).toBe('valid');
    expect(extractUserFromHeader(headers)).toMatchObject(owner);
    expect(extractCPUserFromHeader(headers)).toEqual({ _id: 'cp-1' });
    expect(extractClientPortalFromHeader(headers)).toEqual({
      _id: 'portal-1',
    });
  });

  describe('enforce mode', () => {
    beforeEach(() => {
      process.env.INTERNAL_HEADER_SIGNATURE = 'enforce';
    });

    it('rejects unsigned identity headers', () => {
      const headers = spoofedHeaders();

      expect(verifyIdentityHeaders(headers)).toBe('missing');
      expect(extractUserFromHeader(headers)).toBeNull();
      expect(extractCPUserFromHeader(headers)).toBeNull();
      expect(extractClientPortalFromHeader(headers)).toBeNull();
    });

    it.each([
      ['user', encode({ _id: 'owner-1', groupIds: ['g'] })],
      ['userid', 'someone-else'],
      ['cpuser', encode({ _id: 'cp-2' })],
      ['clientportal', encode({ _id: 'portal-2' })],
      ['hostname', 'other-tenant.example.com'],
      ['nginx-hostname', 'other-tenant'],
    ])('rejects a signed request whose %s was changed', (name, value) => {
      const headers = gatewayHeaders();
      headers[name] = value;

      expect(verifyIdentityHeaders(headers)).toBe('invalid');
      expect(extractUserFromHeader(headers)).toBeNull();
    });

    it('rejects a signature made with another secret', () => {
      const headers = gatewayHeaders();
      process.env.JWT_TOKEN_SECRET = 'other-secret';

      expect(verifyIdentityHeaders(headers)).toBe('invalid');
      expect(extractUserFromHeader(headers)).toBeNull();
    });

    it.each([
      'garbage',
      'v1.123',
      'v2.123.abc',
      'v1.notanumber.abc',
      'v1.123.short',
    ])('rejects a malformed signature %p', (signature) => {
      const headers = spoofedHeaders();
      headers[identitySignatureHeaderName] = signature;

      expect(verifyIdentityHeaders(headers)).toBe('invalid');
      expect(extractUserFromHeader(headers)).toBeNull();
    });

    it('rejects an expired signature', () => {
      const headers = spoofedHeaders();
      const issuedAt = Date.now() - 11 * 60 * 1000;
      headers[identitySignatureHeaderName] = createInternalHeaderSignature(
        'identity',
        [
          getSubdomainFromHeaders(headers),
          String(headers.user),
          String(headers.userid),
          String(headers.cpuser),
          String(headers.clientportal),
        ],
        issuedAt,
      ) as string;

      expect(verifyIdentityHeaders(headers)).toBe('expired');
      expect(extractUserFromHeader(headers)).toBeNull();
    });

    it('rejects every identity header when JWT_TOKEN_SECRET is missing', () => {
      const headers = gatewayHeaders();
      delete process.env.JWT_TOKEN_SECRET;

      expect(verifyIdentityHeaders(headers)).toBe('no-secret');
      expect(extractUserFromHeader(headers)).toBeNull();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('JWT_TOKEN_SECRET is not set'),
      );
    });

    it('trusts the empty identity the gateway sends for anonymous requests', () => {
      const headers: IncomingHttpHeaders = {
        hostname: 'tenant.example.com',
        userid: '',
      };

      expect(isIdentityHeaderTrusted(headers)).toBe(true);
      expect(warn).not.toHaveBeenCalled();
    });

    it('refuses a startup configuration without JWT_TOKEN_SECRET', () => {
      process.env.JWT_TOKEN_SECRET = '  ';

      expect(() => assertInternalHeaderSignatureConfig()).toThrow(
        'INTERNAL_HEADER_SIGNATURE=enforce requires JWT_TOKEN_SECRET',
      );
    });

    it('accepts a startup configuration with JWT_TOKEN_SECRET', () => {
      expect(() => assertInternalHeaderSignatureConfig()).not.toThrow();
    });

    it('drops untrusted identity headers before routes read them', () => {
      const headers = spoofedHeaders();
      dropUntrustedIdentityHeaders(headers);

      expect(headers).toEqual({ hostname: 'tenant.example.com' });
    });

    it('keeps trusted identity headers', () => {
      const headers = gatewayHeaders();
      const before = { ...headers };
      dropUntrustedIdentityHeaders(headers);

      expect(headers).toEqual(before);
    });
  });

  describe('report mode (default)', () => {
    it('starts without JWT_TOKEN_SECRET so local setups keep working', () => {
      delete process.env.JWT_TOKEN_SECRET;

      expect(() => assertInternalHeaderSignatureConfig()).not.toThrow();
    });

    it('still accepts unsigned headers so older gateways keep working', () => {
      const headers: IncomingHttpHeaders = { hostname: 'tenant.example.com' };
      setUserHeader(headers, owner);

      expect(extractUserFromHeader(headers)).toMatchObject(owner);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('INTERNAL_HEADER_SIGNATURE=enforce'),
      );
    });

    it('accepts headers when no secret is configured', () => {
      delete process.env.JWT_TOKEN_SECRET;
      const headers: IncomingHttpHeaders = { hostname: 'tenant.example.com' };
      setUserHeader(headers, owner);

      expect(signIdentityHeaders(headers)).toBeNull();
      expect(extractUserFromHeader(headers)).toMatchObject(owner);
    });

    it('does not drop unsigned headers', () => {
      const headers = spoofedHeaders();
      const before = { ...headers };
      dropUntrustedIdentityHeaders(headers);

      expect(headers).toEqual(before);
    });
  });

  it('signs nothing when there is no identity', () => {
    expect(signIdentityHeaders({ hostname: 'tenant.example.com' })).toBeNull();
  });

  it('resolves the tenant like getSubdomain', () => {
    expect(getSubdomainFromHeaders({ hostname: 'acme.erxes.io' })).toBe('acme');
    expect(
      getSubdomainFromHeaders({
        'nginx-hostname': 'https://beta.erxes.io',
        hostname: 'acme.erxes.io',
      }),
    ).toBe('beta');
  });
});

describe('tRPC context header signature', () => {
  const env = { ...process.env };
  let warn: jest.SpyInstance;

  beforeEach(() => {
    process.env.JWT_TOKEN_SECRET = 'test-secret';
    process.env.INTERNAL_HEADER_SIGNATURE = 'enforce';
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = { ...env };
    warn.mockRestore();
  });

  it('signs the context it sends and accepts it', () => {
    const headers = getTRPCContextHeaders('tenant', 'mutation', {
      userId: 'u1',
    });

    expect(headers[trpcContextSignatureHeaderName]).toBeDefined();
    expect(isTRPCContextHeaderTrusted(headers)).toBe(true);
  });

  it('rejects an unsigned context under enforce', () => {
    expect(
      isTRPCContextHeaderTrusted({
        [trpcContextHeaderName]: encode({ subdomain: 'other-tenant' }),
      }),
    ).toBe(false);
  });

  it('rejects a context changed after signing', () => {
    const headers = getTRPCContextHeaders('tenant', 'query', {});
    headers[trpcContextHeaderName] = encode({ subdomain: 'other-tenant' });

    expect(isTRPCContextHeaderTrusted(headers)).toBe(false);
  });

  it('accepts an unsigned context in report mode', () => {
    process.env.INTERNAL_HEADER_SIGNATURE = 'report';

    expect(
      isTRPCContextHeaderTrusted({
        [trpcContextHeaderName]: encode({ subdomain: 'tenant' }),
      }),
    ).toBe(true);
  });
});
