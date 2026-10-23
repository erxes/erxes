import {
  assertDataExtensionsOwnerProof,
  DATA_EXTENSIONS_PROOF_TTL_MS,
  DataExtensionsForbiddenError,
  ownerProofPayload,
  signDataExtensionsProof,
  verifyDataExtensionsProof,
} from './requestProof';

describe('Data Extensions request proofs', () => {
  const payload = { subdomain: 'tenant-a', userHeader: 'abc' };

  it('verifies a fresh proof for the same payload regardless of key order', () => {
    const proof = signDataExtensionsProof('gateway', payload);

    expect(
      verifyDataExtensionsProof(
        'gateway',
        { userHeader: 'abc', subdomain: 'tenant-a' },
        proof,
      ),
    ).toBe(true);
  });

  it('rejects another tenant, scope, payload or a stale proof', () => {
    const proof = signDataExtensionsProof('gateway', payload, 1_000_000);

    expect(
      verifyDataExtensionsProof('gateway', { ...payload, subdomain: 'tenant-b' }, proof, 1_000_000),
    ).toBe(false);
    expect(verifyDataExtensionsProof('owner', payload, proof, 1_000_000)).toBe(false);
    expect(
      verifyDataExtensionsProof(
        'gateway',
        payload,
        proof,
        1_000_000 + DATA_EXTENSIONS_PROOF_TTL_MS + 1,
      ),
    ).toBe(false);
    expect(verifyDataExtensionsProof('gateway', payload, undefined)).toBe(false);
    expect(
      verifyDataExtensionsProof('gateway', payload, {
        issuedAt: Date.now(),
        signature: 'not-hex',
      }),
    ).toBe(false);
  });

  it('binds owner proofs to the actor and the exact request', () => {
    const request = { recordType: 'core:company', _id: 'c1', values: { tier: 'gold' } };
    const proof = signDataExtensionsProof(
      'owner',
      ownerProofPayload('tenant-a', 'user-1', request),
    );

    expect(() =>
      assertDataExtensionsOwnerProof({ subdomain: 'tenant-a', userId: 'user-1', request, proof }),
    ).not.toThrow();
    expect(() =>
      assertDataExtensionsOwnerProof({ subdomain: 'tenant-a', userId: 'user-2', request, proof }),
    ).toThrow(DataExtensionsForbiddenError);
    expect(() =>
      assertDataExtensionsOwnerProof({
        subdomain: 'tenant-a',
        userId: 'user-1',
        request: { ...request, values: { tier: 'silver' } },
        proof,
      }),
    ).toThrow(DataExtensionsForbiddenError);
    expect(() =>
      assertDataExtensionsOwnerProof({ subdomain: 'tenant-a', userId: undefined, request, proof }),
    ).toThrow(DataExtensionsForbiddenError);
  });
});

describe('missing secret', () => {
  const original = { secret: process.env.JWT_TOKEN_SECRET, env: process.env.NODE_ENV };

  const restore = (name: 'JWT_TOKEN_SECRET' | 'NODE_ENV', value?: string) => {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  };

  afterEach(() => {
    restore('JWT_TOKEN_SECRET', original.secret);
    restore('NODE_ENV', original.env);
  });

  it('refuses to sign outside tests when JWT_TOKEN_SECRET is unset', () => {
    delete process.env.JWT_TOKEN_SECRET;
    process.env.NODE_ENV = 'production';

    expect(() => signDataExtensionsProof('gateway', { a: 1 })).toThrow(
      'JWT_TOKEN_SECRET must be set',
    );
  });
});
