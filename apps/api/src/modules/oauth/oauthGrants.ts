import { oauthCodes, oauthRefreshTokens, runAs, users, withOrg, withSystem } from '@erxes/core-db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { memberOf } from '~/http/auth';
import { sha256 } from '~/lib/crypto';
import { logger } from '~/logger';
import { recordAudit } from '~/modules/audit/audit.service';
import { markClientUsed } from './oauthApps';
import { type OAuthClient, sameHash, splitCredential, usable } from './oauthClients';
import { issueTokens } from './oauthTokens';

const log = logger.child({ component: 'oauth' });

/** Tokens, or why the grant was refused (the token endpoint's `error_description`). */
type Grant = { tokens: Tokens } | { refused: string };

type Tokens = NonNullable<Awaited<ReturnType<typeof issueTokens>>>;

const granted = (tokens: Tokens | null, refused: string): Grant =>
  tokens ? { tokens } : { refused };

/** Tokens for an authorization code: once, by the client it was given to, with the PKCE verifier. */
export const exchangeCode = async (
  client: OAuthClient,
  form: { code?: string; redirect_uri?: string; code_verifier?: string; resource?: string },
) => {
  const { id, secret } = splitCredential(form.code);

  const [code] = id
    ? await withSystem('oauth code lookup', (tx) =>
        tx.select().from(oauthCodes).where(eq(oauthCodes.id, id)).limit(1),
      )
    : [];

  if (
    !code ||
    !secret ||
    !sameHash(code.codeHash, secret) ||
    code.clientId !== client.id ||
    code.redirectUri !== form.redirect_uri ||
    (form.resource !== undefined && form.resource !== code.resource) ||
    code.expiresAt.getTime() < Date.now()
  ) {
    return { refused: 'The code is not valid' };
  }

  if (!form.code_verifier || sha256(form.code_verifier, 'base64url') !== code.codeChallenge) {
    return { refused: 'The PKCE verifier does not match' };
  }

  const tokens = await withOrg(code.orgId, async (tx) => {
    const [used] = await tx
      .update(oauthCodes)
      .set({ usedAt: sql`now()` })
      .where(and(eq(oauthCodes.id, code.id), isNull(oauthCodes.usedAt)))
      .returning({ id: oauthCodes.id });

    // A code works once.
    if (!used || !(await usable(tx, client))) return null;

    const issued = await issueTokens(tx, code);
    const member = issued && (await memberOf(code.orgId, code.userId));

    if (member) {
      await runAs(member, () =>
        recordAudit(tx, {
          action: client.kind === 'app' ? 'auth.app_connected' : 'auth.oauth_signed_in',
          targetType: client.kind,
          targetId: client.id,
          targetLabel: client.title,
        }),
      );
    }

    return issued;
  });

  if (tokens && client.kind === 'app' && client.address === null) await markClientUsed(client.id);

  return granted(tokens, 'The code is not valid');
};

/** Rotates a refresh token; a reused one revokes its whole family. */
export const refreshGrant = async (
  client: OAuthClient,
  form: { refresh_token?: string; resource?: string },
) => {
  const { id, secret } = splitCredential(form.refresh_token);

  const [token] = id
    ? await withSystem('oauth refresh lookup', (tx) =>
        tx.select().from(oauthRefreshTokens).where(eq(oauthRefreshTokens.id, id)).limit(1),
      )
    : [];

  if (
    !token ||
    !secret ||
    !sameHash(token.tokenHash, secret) ||
    token.clientId !== client.id ||
    (form.resource !== undefined && form.resource !== token.resource)
  ) {
    return { refused: 'The refresh token is not valid' };
  }

  const tokens = await withOrg(token.orgId, async (tx) => {
    const [current] = await tx
      .select()
      .from(oauthRefreshTokens)
      .where(eq(oauthRefreshTokens.id, token.id))
      .for('update')
      .limit(1);

    if (!current) return null;

    // Used before (or revoked): it leaked. The whole family stops working.
    if (current.usedAt || current.revokedAt) {
      await tx
        .update(oauthRefreshTokens)
        .set({ revokedAt: sql`now()` })
        .where(
          and(
            eq(oauthRefreshTokens.familyId, current.familyId),
            isNull(oauthRefreshTokens.revokedAt),
          ),
        );
      log.warn(
        { client: client.id, family: current.familyId },
        'oauth refresh token reused: family revoked',
      );

      return null;
    }

    const [user] = await tx
      .select({ version: users.sessionVersion, status: users.status })
      .from(users)
      .where(eq(users.id, current.userId))
      .limit(1);

    if (
      current.expiresAt.getTime() < Date.now() ||
      user?.status !== 'active' ||
      user.version !== current.sessionVersion ||
      !(await usable(tx, client))
    ) {
      return null;
    }

    await tx
      .update(oauthRefreshTokens)
      .set({ usedAt: sql`now()` })
      .where(eq(oauthRefreshTokens.id, current.id));

    return issueTokens(tx, { ...current, nonce: null });
  });

  return granted(tokens, 'The refresh token is not valid');
};

/** Ends a refresh token's family, when the token is genuine. */
export const revokeFamily = async (value: string | undefined) => {
  const { id, secret } = splitCredential(value);

  const [token] = id
    ? await withSystem('oauth revoke lookup', (tx) =>
        tx.select().from(oauthRefreshTokens).where(eq(oauthRefreshTokens.id, id)).limit(1),
      )
    : [];

  if (token && secret && sameHash(token.tokenHash, secret)) {
    await withOrg(token.orgId, (tx) =>
      tx
        .update(oauthRefreshTokens)
        .set({ revokedAt: sql`now()` })
        .where(eq(oauthRefreshTokens.familyId, token.familyId)),
    );
  }
};
