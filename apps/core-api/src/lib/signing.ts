import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  type KeyObject,
} from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { type JWK, type JWTPayload, jwtVerify, SignJWT } from 'jose';
import { z } from 'zod';
import { config } from '~/config';
import { logger } from '~/logger';

const log = logger.child({ component: 'signing' });

/**
 * Core's signing keys (ES256). The private key signs plugin tokens and audit
 * checkpoints; the public keys are published as a JWKS so plugins and auditors
 * verify without any shared secret. Key ids are RFC 7638 thumbprints, so the
 * same key always has the same id. Rotate by moving the current key to
 * `CORE_SIGNING_KEYS_RETIRED` and setting a new `CORE_SIGNING_KEY`.
 */

const SIGNING_ALG = 'ES256';

interface PublicKey {
  kid: string;
  key: KeyObject;
  jwk: JWK;
}

const base64url = (value: Buffer) => value.toString('base64url');

const EcPublicJwk = z.object({
  kty: z.literal('EC'),
  crv: z.literal('P-256'),
  x: z.string(),
  y: z.string(),
});

const toPublic = (key: KeyObject): PublicKey => {
  const parsed = EcPublicJwk.safeParse(key.export({ format: 'jwk' }));

  if (!parsed.success) throw new Error('core signing keys must be EC P-256 (ES256)');

  const jwk = parsed.data;

  // RFC 7638: SHA-256 of the required members in lexicographic order.
  const kid = base64url(
    createHash('sha256')
      .update(JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y }))
      .digest(),
  );

  return {
    kid,
    key,
    jwk: { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, kid, alg: SIGNING_ALG, use: 'sig' },
  };
};

const PEM_BLOCK = /-----BEGIN [A-Z ]+-----[\s\S]+?-----END [A-Z ]+-----/g;

const devKey = (): string => {
  const file = config.auth.signingKeyFile;

  if (existsSync(file)) {
    return readFileSync(file, 'utf8');
  }

  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const pem = privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();

  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, pem, { mode: 0o600 });
  log.info({ file }, 'generated a development signing key');

  return pem;
};

let loaded: { privateKey: KeyObject; current: PublicKey; byKid: Map<string, PublicKey> } | null =
  null;

const keys = () => {
  if (loaded) return loaded;

  const privateKey = createPrivateKey((config.auth.signingKey ?? devKey()).replace(/\\n/g, '\n'));
  const current = toPublic(createPublicKey(privateKey));
  const byKid = new Map([[current.kid, current]]);

  for (const block of (config.auth.retiredSigningKeys ?? '')
    .replace(/\\n/g, '\n')
    .match(PEM_BLOCK) ?? []) {
    const retired = toPublic(createPublicKey(block));

    byKid.set(retired.kid, retired);
  }

  loaded = { privateKey, current, byKid };

  return loaded;
};

/** Loads (or, in development, creates) the keys now, so a bad key fails at startup. */
export const loadSigningKeys = () => keys().current.kid;

export const currentKeyId = () => keys().current.kid;

/** The public keys, current first: `GET /core/v1/.well-known/jwks.json`. */
export const publicJwks = () => ({ keys: [...keys().byKid.values()].map((key) => key.jwk) });

export interface SignOptions {
  /** JOSE `typ` header, so one kind of token is never accepted as another. */
  typ: string;
  audience?: string | string[];
  subject?: string;
  expiresInSeconds?: number;
  jti?: string;
}

export const ISSUER = 'erxes-core';

export const signJwt = (payload: JWTPayload, options: SignOptions): Promise<string> => {
  const { privateKey, current } = keys();

  let jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: SIGNING_ALG, kid: current.kid, typ: options.typ })
    .setIssuer(ISSUER)
    .setIssuedAt();

  if (options.audience) jwt = jwt.setAudience(options.audience);

  if (options.subject) jwt = jwt.setSubject(options.subject);

  if (options.expiresInSeconds) jwt = jwt.setExpirationTime(`${options.expiresInSeconds}s`);

  if (options.jti) jwt = jwt.setJti(options.jti);

  return jwt.sign(privateKey);
};

/**
 * Verifies a token core signed (any published key), checking `typ`, issuer
 * and audience, and parses its claims with `claims`.
 */
export const verifyJwt = async <T>(
  token: string,
  claims: z.ZodType<T, z.ZodTypeDef, unknown>,
  options: { typ: string; audience?: string; maxTokenAge?: string },
) => {
  const { byKid } = keys();

  const { payload } = await jwtVerify(
    token,
    (header) => {
      const key = header.kid ? byKid.get(header.kid) : undefined;

      if (!key) throw new Error('unknown signing key');

      return key.key;
    },
    {
      algorithms: [SIGNING_ALG],
      issuer: ISSUER,
      typ: options.typ,
      audience: options.audience,
      maxTokenAge: options.maxTokenAge,
    },
  );

  return claims.parse(payload);
};
