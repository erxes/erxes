import {
  getTRPCAuthSecret,
  signTRPCContext,
  verifyTRPCContext,
} from './serviceAuth';

describe('trpc serviceAuth', () => {
  const ORIGINAL_ENV = { ...process.env };
  const procedurePath = 'deal.find';
  const contextHeader = Buffer.from(
    JSON.stringify({ subdomain: 'acme', method: 'query' }),
  ).toString('base64');
  const sign = () => signTRPCContext(contextHeader, procedurePath);

  beforeEach(() => {
    process.env.JWT_TOKEN_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.restoreAllMocks();
  });

  it('accepts a context header signed with the shared secret', () => {
    expect(verifyTRPCContext(contextHeader, sign(), procedurePath)).toBe(true);
  });

  it('rejects a context header that differs from the signed one', () => {
    const forged = Buffer.from(
      JSON.stringify({ subdomain: 'other', method: 'query' }),
    ).toString('base64');

    expect(verifyTRPCContext(forged, sign(), procedurePath)).toBe(false);
  });

  it('rejects a credential replayed against another procedure', () => {
    expect(verifyTRPCContext(contextHeader, sign(), 'deal.updateOne')).toBe(
      false,
    );
    expect(verifyTRPCContext(contextHeader, sign(), `${procedurePath},x`)).toBe(
      false,
    );
  });

  it('rejects a signature produced with another secret', () => {
    const auth = sign();

    process.env.JWT_TOKEN_SECRET = 'another-secret';

    expect(verifyTRPCContext(contextHeader, auth, procedurePath)).toBe(false);
  });

  it('rejects missing, malformed, and repeated credentials', () => {
    const auth = sign();

    expect(verifyTRPCContext(contextHeader, undefined, procedurePath)).toBe(
      false,
    );
    expect(verifyTRPCContext(undefined, auth, procedurePath)).toBe(false);
    expect(
      verifyTRPCContext(contextHeader, 'no-separator', procedurePath),
    ).toBe(false);
    expect(
      verifyTRPCContext(contextHeader, 'not-a-number.signature', procedurePath),
    ).toBe(false);
    expect(verifyTRPCContext(contextHeader, [auth, auth], procedurePath)).toBe(
      false,
    );
    expect(verifyTRPCContext([contextHeader], auth, procedurePath)).toBe(false);
  });

  it('rejects an expired signature and one issued in the future', () => {
    const now = Date.now();
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(now);
    const auth = sign();
    const ttl = 5 * 60 * 1000;

    nowSpy.mockReturnValue(now + ttl + 1);
    expect(verifyTRPCContext(contextHeader, auth, procedurePath)).toBe(false);

    nowSpy.mockReturnValue(now - ttl - 1);
    expect(verifyTRPCContext(contextHeader, auth, procedurePath)).toBe(false);

    nowSpy.mockReturnValue(now + 60 * 1000);
    expect(verifyTRPCContext(contextHeader, auth, procedurePath)).toBe(true);
  });

  it('refuses the development secret in production', () => {
    delete process.env.JWT_TOKEN_SECRET;
    process.env.NODE_ENV = 'production';

    expect(() => getTRPCAuthSecret()).toThrow('JWT_TOKEN_SECRET');
    expect(() => sign()).toThrow('JWT_TOKEN_SECRET');
    expect(verifyTRPCContext(contextHeader, '1.signature', procedurePath)).toBe(
      false,
    );
  });

  it('falls back to the development secret outside production', () => {
    delete process.env.JWT_TOKEN_SECRET;

    expect(() => getTRPCAuthSecret()).not.toThrow();
    expect(verifyTRPCContext(contextHeader, sign(), procedurePath)).toBe(true);
  });
});
