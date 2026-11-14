import type { CustomerTokens } from '@erxes/core-contract';
import { customerSessions, type Db, newId, withOrg, withSystem } from '@erxes/core-db';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { sha256 } from '~/lib/crypto';
import { signJwt, verifyJwt } from '~/lib/signing';
import { newSecret, sameHash, splitCredential } from '~/modules/oauth/oauthClients';

/** JOSE `typ` of customer access tokens; member and plugin checks never accept it. */
const CUSTOMER_ACCESS_TYP = 'customer+jwt';

/** Audience of customer access tokens: core and every plugin's API. */
const CUSTOMER_AUDIENCE = 'erxes-customer';

const SESSION_DAYS = 90;

const CUSTOMER_ACCESS_SECONDS = 900;

interface CustomerSessionRef {
  orgId: string;
  customerId: string;
  sessionId: string;
}

/** A 15-minute access token for core's `/customer/*` and every plugin's API. */
const customerAccessToken = (ref: CustomerSessionRef, clientId: string) =>
  signJwt(
    { org: ref.orgId, client_id: clientId, sid: ref.sessionId },
    {
      typ: CUSTOMER_ACCESS_TYP,
      audience: CUSTOMER_AUDIENCE,
      subject: ref.customerId,
      expiresInSeconds: CUSTOMER_ACCESS_SECONDS,
    },
  );

const tokensFor = async (
  ref: CustomerSessionRef,
  clientId: string,
  refreshToken: string,
): Promise<CustomerTokens> => ({
  accessToken: await customerAccessToken(ref, clientId),
  refreshToken,
  expiresIn: CUSTOMER_ACCESS_SECONDS,
});

/** A new session in the app (90 days from its last use) and its first tokens. */
export const createSession = async (
  tx: Db,
  session: {
    orgId: string;
    customerId: string;
    clientId: string;
    userAgent?: string | null;
    ip?: string | null;
  },
) => {
  const id = newId();
  const secret = newSecret();

  await tx.insert(customerSessions).values({
    id,
    customerId: session.customerId,
    clientId: session.clientId,
    tokenHash: sha256(secret),
    userAgent: session.userAgent?.slice(0, 500) ?? null,
    ip: session.ip ?? null,
    expiresAt: sql`now() + make_interval(days => ${SESSION_DAYS})`,
  });

  return tokensFor(
    { orgId: session.orgId, customerId: session.customerId, sessionId: id },
    session.clientId,
    `${id}.${secret}`,
  );
};

/** The session a refresh token names (any organisation: the token is all a caller has). */
export const sessionOf = async (token: string | undefined) => {
  const { id, secret } = splitCredential(token);

  if (!id || !secret) return null;

  const [row] = await withSystem('customer session lookup', (tx) =>
    tx.select().from(customerSessions).where(eq(customerSessions.id, id)).limit(1),
  );

  return row ? { row, secret } : null;
};

type FoundSession = NonNullable<Awaited<ReturnType<typeof sessionOf>>>;

/**
 * Trades the session's refresh token for new tokens. The previous token used
 * again means it leaked: the session ends.
 */
export const rotateSession = ({ row, secret }: FoundSession) =>
  withOrg(row.orgId, async (tx) => {
    if (row.previousTokenHash && sameHash(row.previousTokenHash, secret)) {
      await tx
        .update(customerSessions)
        .set({ revokedAt: sql`now()` })
        .where(eq(customerSessions.id, row.id));

      return null;
    }

    const next = newSecret();

    // Only the current token rotates, once: a concurrent use of the same token finds it changed.
    const [rotated] = await tx
      .update(customerSessions)
      .set({
        tokenHash: sha256(next),
        previousTokenHash: row.tokenHash,
        lastUsedAt: sql`now()`,
        expiresAt: sql`now() + make_interval(days => ${SESSION_DAYS})`,
      })
      .where(
        and(
          eq(customerSessions.id, row.id),
          eq(customerSessions.tokenHash, sha256(secret)),
          isNull(customerSessions.revokedAt),
          gt(customerSessions.expiresAt, sql`now()`),
        ),
      )
      .returning({ id: customerSessions.id });

    if (!rotated) return null;

    return tokensFor(
      { orgId: row.orgId, customerId: row.customerId, sessionId: row.id },
      row.clientId,
      `${row.id}.${next}`,
    );
  });

/** Ends the session a refresh token (current or previous) belongs to. */
export const revokeSessionToken = async (token: string) => {
  const found = await sessionOf(token);

  if (
    !found ||
    !(
      sameHash(found.row.tokenHash, found.secret) ||
      (found.row.previousTokenHash !== null && sameHash(found.row.previousTokenHash, found.secret))
    )
  ) {
    return;
  }

  await withOrg(found.row.orgId, (tx) =>
    tx
      .update(customerSessions)
      .set({ revokedAt: sql`now()` })
      .where(eq(customerSessions.id, found.row.id)),
  );
};

const AccessClaims = z.object({
  sub: z.string().min(1),
  org: z.string().min(1),
  client_id: z.string().min(1),
  sid: z.string().min(1),
});

/** The customer behind an access token, while its session lasts (signing out ends it here at once). */
export const customerOfToken = async (token: string) => {
  const claims = await verifyJwt(token, AccessClaims, {
    typ: CUSTOMER_ACCESS_TYP,
    audience: CUSTOMER_AUDIENCE,
  }).catch(() => null);

  if (!claims) return null;

  const [session] = await withOrg(claims.org, (tx) =>
    tx
      .select({ id: customerSessions.id })
      .from(customerSessions)
      .where(
        and(
          eq(customerSessions.id, claims.sid),
          eq(customerSessions.customerId, claims.sub),
          isNull(customerSessions.revokedAt),
          gt(customerSessions.expiresAt, sql`now()`),
        ),
      )
      .limit(1),
  );

  return session
    ? {
        orgId: claims.org,
        customerId: claims.sub,
        sessionId: claims.sid,
        clientId: claims.client_id,
      }
    : null;
};
