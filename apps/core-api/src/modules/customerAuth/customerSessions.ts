import { customerSessions, type Db, newId, withOrg, withSystem } from '@erxes/core-db';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import type { CookieOptions, Request } from 'express';
import { z } from 'zod';
import { readCookies } from '~/http/cookies';
import { signJwt, verifyJwt } from '~/lib/signing';
import { newSecret, sameHash, sha256, splitCredential } from '~/modules/oauth/oauthClients';

/** The browser session on core's customer sign-in page. */
export const CUSTOMER_COOKIE = 'erxes_customer';

/** JOSE `typ` of customer access tokens; member and plugin checks never accept it. */
const CUSTOMER_ACCESS_TYP = 'customer+jwt';

/** Audience of customer access tokens: core and every plugin's API. */
const CUSTOMER_AUDIENCE = 'erxes-customer';

const SESSION_DAYS = 90;

export const CUSTOMER_ACCESS_SECONDS = 900;

export const customerCookieOptions = (req: Request): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: req.secure,
  path: '/',
  maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
});

export interface CustomerSessionRef {
  orgId: string;
  customerId: string;
  sessionId: string;
}

/** A new session (browser: `clientId` null; app: the plugin); returns its `<id>.<secret>` token. */
export const createSession = async (
  tx: Db,
  session: {
    orgId: string;
    customerId: string;
    clientId: string | null;
    userAgent?: string | null;
    ip?: string | null;
  },
) => {
  const id = newId();
  const secret = newSecret();

  await tx.insert(customerSessions).values({
    id,
    orgId: session.orgId,
    customerId: session.customerId,
    clientId: session.clientId,
    tokenHash: sha256(secret),
    userAgent: session.userAgent?.slice(0, 500) ?? null,
    ip: session.ip ?? null,
    expiresAt: sql`now() + make_interval(days => ${SESSION_DAYS})`,
  });

  return { id, token: `${id}.${secret}` };
};

/** The session a token names (any organisation: the token is all a caller has). */
const sessionOf = async (token: string | undefined) => {
  const { id, secret } = splitCredential(token);

  if (!id || !secret) return null;

  const [row] = await withSystem('customer session lookup', (tx) =>
    tx.select().from(customerSessions).where(eq(customerSessions.id, id)).limit(1),
  );

  return row ? { row, secret } : null;
};

const live = (row: typeof customerSessions.$inferSelect) =>
  !row.revokedAt && row.expiresAt.getTime() > Date.now();

/** The customer signed in on core's sign-in page in this browser, if any. */
export const browserSession = async (req: Request): Promise<CustomerSessionRef | null> => {
  const found = await sessionOf(readCookies(req.headers.cookie)[CUSTOMER_COOKIE]);

  if (
    !found ||
    found.row.clientId !== null ||
    !live(found.row) ||
    !sameHash(found.row.tokenHash, found.secret)
  ) {
    return null;
  }

  return { orgId: found.row.orgId, customerId: found.row.customerId, sessionId: found.row.id };
};

/**
 * Trades an app's refresh token for a new one. The previous token used again
 * means it leaked: the session ends.
 */
export const rotateSession = async (clientId: string, token: string | undefined) => {
  const found = await sessionOf(token);

  if (!found || found.row.clientId !== clientId) return null;

  const { row, secret } = found;

  return withOrg(row.orgId, async (tx) => {
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

    return {
      ref: { orgId: row.orgId, customerId: row.customerId, sessionId: row.id },
      token: `${row.id}.${next}`,
    };
  });
};

/** Ends the session a token (current or previous) belongs to. */
export const revokeSessionToken = async (token: string | undefined, clientId: string | null) => {
  const found = await sessionOf(token);

  if (
    !found ||
    found.row.clientId !== clientId ||
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

/** A 15-minute access token for core's `/customer/*` and every plugin's API. */
export const customerAccessToken = (ref: CustomerSessionRef, clientId: string) =>
  signJwt(
    { org: ref.orgId, client_id: clientId, sid: ref.sessionId },
    {
      typ: CUSTOMER_ACCESS_TYP,
      audience: CUSTOMER_AUDIENCE,
      subject: ref.customerId,
      expiresInSeconds: CUSTOMER_ACCESS_SECONDS,
    },
  );

const AccessClaims = z.object({
  sub: z.string().min(1),
  org: z.string().min(1),
  client_id: z.string(),
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
          eq(customerSessions.orgId, claims.org),
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
