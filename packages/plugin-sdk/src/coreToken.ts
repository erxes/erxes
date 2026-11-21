import { CORE_API_PREFIX } from '@erxes/core-contract';
import { base64url, createRemoteJWKSet, jwtVerify } from 'jose';
import type { z } from 'zod';

export interface VerifyOptions {
  coreUrl: string;
  plugin: string;
}

const jwksByCore = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

/**
 * The plugin's server clock may run a little ahead of core's: a token core
 * just issued, or one a member's browser renews 30 s before it ends, still passes.
 */
const CLOCK_TOLERANCE_SECONDS = 60;

/** A token core signed (its public keys), for this plugin (or `audience`), of this kind, unexpired; its claims parsed. */
export const verifyCoreToken = async <T>(
  token: string,
  options: Pick<VerifyOptions, 'coreUrl'> & { plugin?: string },
  typ: string,
  claims: z.ZodType<T>,
  audience = options.plugin,
) => {
  const base = options.coreUrl.replace(/\/+$/, '');
  let jwks = jwksByCore.get(base);

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${base}${CORE_API_PREFIX}/.well-known/jwks.json`));
    jwksByCore.set(base, jwks);
  }

  if (!audience) throw new Error('no audience to check the token for');

  const { payload } = await jwtVerify(token, jwks, {
    issuer: 'erxes-core',
    audience,
    typ,
    algorithms: ['ES256'],
    clockTolerance: CLOCK_TOLERANCE_SECONDS,
  });

  const parsed = claims.safeParse(payload);

  if (!parsed.success) throw new Error(`not an erxes ${typ} token`);

  return parsed.data;
};

/** The bearer token of a request's `Authorization` header, if any. */
export const bearerOf = (authorization: string | undefined | null) =>
  authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() || null : null;

/** A body's SHA-256, base64url: text as UTF-8, or its bytes as they came. */
export const sha256 = async (body: string | Uint8Array<ArrayBuffer>) => {
  const digest = new Uint8Array(
    await crypto.subtle.digest(
      'SHA-256',
      typeof body === 'string' ? new TextEncoder().encode(body) : body,
    ),
  );

  return base64url.encode(digest);
};
