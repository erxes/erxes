import { oauthCodes, oauthRefreshTokens, users, withOrg, withSystem } from '@erxes/core-db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { sha256 } from '~/lib/crypto';
import { logger } from '~/logger';
import { recordAudit } from '~/modules/audit/audit.service';
import {
  clientTitle,
  installed,
  type OAuthClient,
  sameHash,
  splitCredential,
} from './oauthClients';
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
  form: { code?: string; redirect_uri?: string; code_verifier?: string },
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
    code.clientId !== client.name ||
    code.redirectUri !== form.redirect_uri ||
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
    if (!used || !(await installed(tx, client.name))) return null;

    const issued = await issueTokens(tx, code);

    if (issued) {
      await recordAudit(
        tx,
        { orgId: code.orgId, actorType: 'user', actorId: code.userId, source: 'core' },
        {
          action: 'auth.oauth_signed_in',
          targetType: 'plugin',
          targetId: client.name,
          targetLabel: clientTitle(client),
        },
      );
    }

    return issued;
  });

  return granted(tokens, 'The code is not valid');
};

/** Rotates a refresh token; a reused one revokes its whole family. */
export const refreshGrant = async (client: OAuthClient, form: { refresh_token?: string }) => {
  const { id, secret } = splitCredential(form.refresh_token);

  const [token] = id
    ? await withSystem('oauth refresh lookup', (tx) =>
        tx.select().from(oauthRefreshTokens).where(eq(oauthRefreshTokens.id, id)).limit(1),
      )
    : [];

  if (!token || !secret || !sameHash(token.tokenHash, secret) || token.clientId !== client.name) {
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
        { client: client.name, family: current.familyId },
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
      !(await installed(tx, client.name))
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
