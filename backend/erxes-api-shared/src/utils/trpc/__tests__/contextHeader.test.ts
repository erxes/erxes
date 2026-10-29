import {
  decodeTRPCContextHeader,
  encodeTRPCContextHeader,
  trpcContextHeaderName,
} from '..';

beforeEach(() => {
  process.env.JWT_TOKEN_SECRET = 'test-identity-secret';
});

describe('tRPC context header', () => {
  it('carries tenant and caller between services', () => {
    const header = encodeTRPCContextHeader('acme', 'mutation', {
      userId: 'u1',
    });

    expect(
      decodeTRPCContextHeader({ [trpcContextHeaderName]: header }),
    ).toEqual({
      subdomain: 'acme',
      method: 'mutation',
      context: { userId: 'u1' },
    });
  });

  it('rejects a forged unsigned context naming any tenant and user', () => {
    const forged = Buffer.from(
      JSON.stringify({ subdomain: 'victim', method: 'mutation', userId: 'u1' }),
    ).toString('base64');

    expect(
      decodeTRPCContextHeader({ [trpcContextHeaderName]: forged }),
    ).toBeNull();
  });

  it('rejects a signed context moved to another tenant', () => {
    const header = encodeTRPCContextHeader('acme', 'query', {});
    const [payload, signature] = header.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    decoded.subdomain = 'victim';
    const moved = Buffer.from(JSON.stringify(decoded)).toString('base64url');

    expect(
      decodeTRPCContextHeader({
        [trpcContextHeaderName]: `${moved}.${signature}`,
      }),
    ).toBeNull();
  });
});
