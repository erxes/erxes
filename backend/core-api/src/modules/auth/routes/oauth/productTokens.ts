import {
  createHash,
  createPublicKey,
  generateKeyPairSync,
  JsonWebKey,
  KeyObject,
} from 'crypto';
import { getEnv } from 'erxes-api-shared/utils';
import { readFileSync } from 'fs';
import * as jwt from 'jsonwebtoken';

/**
 * Access tokens for products that sign people in with erxes (authorization
 * code + PKCE). They are RS256 JWTs: a product verifies them with the public
 * keys at `/.well-known/jwks.json` and can never mint one, unlike the
 * HS256 tokens core and the gateway share a secret for.
 */
export const PRODUCT_TOKEN_TYPE = 'erxes_access';
export const PRODUCT_ACCESS_TOKEN_EXPIRES_IN = 15 * 60;

interface SigningKey {
  privateKeyPem: string;
  publicJwk: JsonWebKey & { kid: string; alg: 'RS256'; use: 'sig' };
}

let signingKey: SigningKey | null = null;

const readConfiguredKey = (): string => {
  const inline = getEnv({ name: 'OAUTH_SIGNING_KEY' });

  if (inline) {
    // Env files often carry the PEM on one line with literal \n
    return inline.replace(/\\n/g, '\n');
  }

  const file = getEnv({ name: 'OAUTH_SIGNING_KEY_FILE' });

  return file ? readFileSync(file, 'utf8') : '';
};

/** RFC 7638 thumbprint, so the key id changes only when the key does. */
const thumbprint = (jwk: JsonWebKey) =>
  createHash('sha256')
    .update(JSON.stringify({ e: jwk.e, kty: jwk.kty, n: jwk.n }))
    .digest('base64url');

const toSigningKey = (privateKeyPem: string): SigningKey => {
  const publicKey: KeyObject = createPublicKey(privateKeyPem);
  const jwk = publicKey.export({ format: 'jwk' });

  if (jwk.kty !== 'RSA') {
    throw new Error('OAUTH_SIGNING_KEY must be an RSA private key');
  }

  return {
    privateKeyPem,
    publicJwk: { ...jwk, kid: thumbprint(jwk), alg: 'RS256', use: 'sig' },
  };
};

export const getSigningKey = (): SigningKey => {
  if (signingKey) {
    return signingKey;
  }

  const configured = readConfiguredKey();

  if (configured) {
    signingKey = toSigningKey(configured);
    return signingKey;
  }

  if (getEnv({ name: 'NODE_ENV' }) === 'production') {
    throw new Error(
      'OAUTH_SIGNING_KEY or OAUTH_SIGNING_KEY_FILE is required to sign product tokens',
    );
  }

  // Development only: tokens stop verifying when core restarts
  console.warn(
    '[oauth] No OAUTH_SIGNING_KEY; using a temporary development signing key',
  );

  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

  signingKey = toSigningKey(
    privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  );

  return signingKey;
};

/** For tests: forget the cached key so env changes apply. */
export const resetSigningKey = () => {
  signingKey = null;
};

export const getJwks = () => ({ keys: [getSigningKey().publicJwk] });

/** `iss` of product tokens: OAUTH_ISSUER, else the erxes DOMAIN. */
export const getIssuer = (subdomain?: string) =>
  (
    getEnv({ name: 'OAUTH_ISSUER' }) ||
    getEnv({ name: 'DOMAIN', subdomain }) ||
    'erxes'
  ).replace(/\/+$/, '');

export const signProductAccessToken = ({
  user,
  clientId,
  subdomain,
  organizationId,
  scope,
  expiresIn = PRODUCT_ACCESS_TOKEN_EXPIRES_IN,
}: {
  user: Record<string, unknown> & { _id: string };
  clientId: string;
  subdomain: string;
  /** Permanent organisation id (`oid`); `tid` is the subdomain, which can change. */
  organizationId: string;
  scope?: string;
  expiresIn?: number;
}) => {
  const { privateKeyPem, publicJwk } = getSigningKey();

  return jwt.sign(
    {
      typ: PRODUCT_TOKEN_TYPE,
      tid: subdomain,
      oid: organizationId,
      user,
      ...(scope ? { scope } : {}),
    },
    privateKeyPem,
    {
      algorithm: 'RS256',
      keyid: publicJwk.kid,
      issuer: getIssuer(subdomain),
      audience: clientId,
      subject: String(user._id),
      expiresIn,
    },
  );
};
