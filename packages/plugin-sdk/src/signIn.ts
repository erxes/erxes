import { PluginSignInRequest } from '@erxes/core-contract';
import { z } from 'zod';
import { bodyDigest, verifyCoreToken, type VerifyOptions } from './coreToken';
import { bearerOf } from './verify';

/** A member's login and password core asks a sign-in provider to check (`manifest.signIn`). */
export interface CoreSignIn extends PluginSignInRequest {
  /** The organisation they sign in to. */
  orgId: string;
}

const SignInClaims = z.object({ sha: z.string(), signIn: z.string(), org: z.string() });

/**
 * Verifies core's POST to `<api.url>/auth/sign-in` (`manifest.signIn`) and returns what the member
 * typed, with their organisation: the token is core's, for this plugin, at most a minute old, and
 * signs this exact body (pass the raw body text). Throws if not. Answer 200 with a
 * `PluginSignInIdentity` when the login and password are right, 401 when they aren't.
 *
 *     app.post('/auth/sign-in', express.text({ type: 'application/json' }), async (req, res) => {
 *       const { orgId, login, password } = await verifyCoreSignIn(req.headers.authorization, req.body, { coreUrl, plugin: 'ldap' });
 *       const entry = await directoryOf(orgId).check(login, password);
 *       if (!entry) return res.sendStatus(401);
 *       res.json({ subject: entry.uuid, email: entry.mail, linkByEmail: true });
 *     });
 */
export const verifyCoreSignIn = async (
  authorization: string | undefined | null,
  rawBody: string,
  options: VerifyOptions,
): Promise<CoreSignIn> => {
  const token = bearerOf(authorization);

  if (!token) throw new Error('no core token');

  const claims = await verifyCoreToken(token, options, 'erxes-core-sign-in+jwt', SignInClaims);

  if (claims.sha !== (await bodyDigest(rawBody)))
    throw new Error('the body does not match the token');

  return { orgId: claims.org, ...PluginSignInRequest.parse(JSON.parse(rawBody)) };
};
