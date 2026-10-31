import { createPublicKey, JsonWebKey, KeyObject } from 'crypto';
import { getEnv, redis } from 'erxes-api-shared/utils';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface ISupportStaff {
  staffId: string;
  name: string;
  email: string;
  reason: string;
}

const ISSUER = 'erxes-saas';
const TOKEN_TYPE = 'support_login';
const MAX_TOKEN_AGE_SECS = 60;
const STAFF_ID = /^[A-Za-z0-9_-]{1,64}$/;

let publicKeys: Map<string, KeyObject> | undefined;

// Keyed by kid so global-profile can rotate its signing key without downtime
const getPublicKeys = () => {
  if (publicKeys) {
    return publicKeys;
  }

  publicKeys = new Map();

  try {
    const jwks = JSON.parse(
      getEnv({ name: 'SUPPORT_LOGIN_JWKS' }) || '[]',
    ) as JsonWebKey[];

    for (const jwk of jwks) {
      if (
        typeof jwk.kid === 'string' &&
        jwk.kty === 'EC' &&
        jwk.crv === 'P-256'
      ) {
        publicKeys.set(jwk.kid, createPublicKey({ key: jwk, format: 'jwk' }));
      }
    }
  } catch (e) {
    console.error(`SUPPORT_LOGIN_JWKS is invalid: ${(e as Error).message}`);
  }

  return publicKeys;
};

/** Tests swap keys between cases. */
export const resetSupportLoginKeys = () => {
  publicKeys = undefined;
};

export const isSupportAccessAvailable = () =>
  getEnv({ name: 'VERSION' }) === 'saas' && getPublicKeys().size > 0;

// Names reach notification emails that render them unescaped
const clean = (value: unknown, max: number) =>
  typeof value === 'string'
    ? value.replace(/[<>"'`]/g, '').trim().slice(0, max)
    : '';

/** The staff member a token names, or null when it is forged, foreign, stale or spent. */
export const verifySupportToken = async (
  token: string,
  subdomain: string,
): Promise<ISupportStaff | null> => {
  if (!token || !isSupportAccessAvailable()) {
    return null;
  }

  const kid = jwt.decode(token, { complete: true })?.header.kid;
  const key = kid ? getPublicKeys().get(kid) : undefined;

  if (!key) {
    return null;
  }

  let payload: JwtPayload;

  try {
    // Pinned to ES256: alg none and HS256 signed with the public key never verify
    payload = jwt.verify(token, key, {
      algorithms: ['ES256'],
      audience: subdomain,
      issuer: ISSUER,
      maxAge: MAX_TOKEN_AGE_SECS,
      clockTolerance: 10,
    }) as JwtPayload;
  } catch {
    return null;
  }

  const { sub, jti, iat, exp } = payload;
  const name = clean(payload.name, 100);
  const reason = clean(payload.reason, 200);

  if (
    payload.typ !== TOKEN_TYPE ||
    !sub ||
    !STAFF_ID.test(sub) ||
    typeof jti !== 'string' ||
    !jti ||
    !iat ||
    !exp ||
    exp - iat > MAX_TOKEN_AGE_SECS ||
    !name ||
    !reason
  ) {
    return null;
  }

  // One visit per token: a URL left in a log or history is already spent
  const firstUse = await redis.set(
    `support_login_used:${jti}`,
    1,
    'EX',
    2 * MAX_TOKEN_AGE_SECS,
    'NX',
  );

  if (!firstUse) {
    return null;
  }

  return { staffId: sub, name, email: clean(payload.email, 200), reason };
};
