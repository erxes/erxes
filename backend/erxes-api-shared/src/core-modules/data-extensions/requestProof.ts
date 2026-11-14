import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Data Extensions hops (gateway -> runtime -> owner) carry identity in
 * headers and tRPC context that a client could otherwise forge through the
 * generic plugin proxy. Each hop is signed with the platform JWT secret and
 * expires quickly, so only a party holding the secret can assert identity.
 */
export const DATA_EXTENSIONS_PROOF_TTL_MS = 60_000;

export const DATA_EXTENSIONS_PROOF_HEADERS = {
  subdomain: 'x-data-extensions-subdomain',
  issuedAt: 'x-data-extensions-issued-at',
  signature: 'x-data-extensions-signature',
} as const;

export class DataExtensionsForbiddenError extends Error {
  readonly isExpected = true;
  readonly code = 'FORBIDDEN';

  constructor() {
    super('Data Extensions request is not signed by the runtime');
    this.name = 'ExpectedError';
    Object.setPrototypeOf(this, DataExtensionsForbiddenError.prototype);
  }
}

export interface IDataExtensionsProof {
  issuedAt: number;
  signature: string;
}

/**
 * The platform JWT secret signs every hop. Without it, a proof would be
 * forgeable, so signing and verification refuse to run (tests excepted).
 */
const secret = () => {
  const value = process.env.JWT_TOKEN_SECRET;

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === 'test') {
    return 'data-extensions-test-secret';
  }

  throw new Error('JWT_TOKEN_SECRET must be set for Data Extensions');
};

/** JSON with sorted keys, so both sides sign identical bytes. */
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.keys(value as Record<string, unknown>)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`,
      );

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value ?? null);
};

const sign = (scope: string, issuedAt: number, payload: unknown) =>
  createHmac('sha256', secret())
    .update(`${scope}\n${issuedAt}\n${canonical(payload)}`)
    .digest('hex');

export const signDataExtensionsProof = (
  scope: string,
  payload: unknown,
  issuedAt = Date.now(),
): IDataExtensionsProof => ({
  issuedAt,
  signature: sign(scope, issuedAt, payload),
});

export const verifyDataExtensionsProof = (
  scope: string,
  payload: unknown,
  proof: Partial<IDataExtensionsProof> | undefined | null,
  now = Date.now(),
): boolean => {
  if (
    !proof ||
    typeof proof.signature !== 'string' ||
    typeof proof.issuedAt !== 'number' ||
    !Number.isFinite(proof.issuedAt) ||
    Math.abs(now - proof.issuedAt) > DATA_EXTENSIONS_PROOF_TTL_MS
  ) {
    return false;
  }

  const expected = Buffer.from(sign(scope, proof.issuedAt, payload), 'hex');
  const actual = Buffer.from(proof.signature, 'hex');

  return (
    expected.length === actual.length && timingSafeEqual(expected, actual)
  );
};

/** What the gateway vouches for on the typed endpoint. */
export const gatewayProofPayload = (
  subdomain: string,
  userHeader: string,
) => ({ subdomain, userHeader });

/** What the runtime vouches for when it calls a record owner. */
export const ownerProofPayload = (
  subdomain: string,
  userId: string,
  request: Record<string, unknown>,
) => ({ subdomain, userId, request });

/**
 * Owners accept a lookup or patch only with a fresh proof from the runtime
 * for this tenant, actor and exact request, so a forged tRPC context reaching
 * the owner through a plugin proxy gets nothing.
 */
export const assertDataExtensionsOwnerProof = ({
  subdomain,
  userId,
  request,
  proof,
}: {
  subdomain: string;
  userId?: string;
  request: Record<string, unknown>;
  proof?: Partial<IDataExtensionsProof> | null;
}) => {
  if (
    !userId ||
    !verifyDataExtensionsProof(
      'owner',
      ownerProofPayload(subdomain, userId, request),
      proof,
    )
  ) {
    throw new DataExtensionsForbiddenError();
  }
};
