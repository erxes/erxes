import { CORE_API_PREFIX } from '@erxes/core-contract';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { z } from 'zod';

/** Checks tokens core signs; the SDK's `verify*` functions use it, plugins don't. */

const jwksByCore = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

/**
 * The plugin's server clock may run a little ahead of core's: a token core
 * just issued, or one a member's browser renews 30 s before it ends, still passes.
 */
const CLOCK_TOLERANCE_SECONDS = 60;

/** A token core signed (its public keys), for this plugin (or `audience`), of this kind, unexpired; its claims parsed. */
export const verifyCoreToken = async <T>(
  token: string,
  options: { coreUrl: string; plugin?: string },
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
