import type { CustomerTokens } from '@erxes/core-contract';
import {
  customerAccounts,
  customerSessions,
  type Db,
  newId,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { coreKey } from '~/lib/coreKey';
import { hmacSha256, sha256 } from '~/lib/crypto';
import { signJwt, verifyJwt } from '~/lib/signing';
import { newSecret, sameHash, splitCredential } from '~/modules/oauth/oauthClients';

/** JOSE `typ` of customer access tokens; member and plugin checks never accept it. */
const CUSTOMER_ACCESS_TYP = 'customer+jwt';

/** Audience of customer access tokens: core and every plugin's API. */
const CUSTOMER_AUDIENCE = 'erxes-customer';

const SESSION_DAYS = 90;

const CUSTOMER_ACCESS_SECONDS = 900;

/**
 * How long a replaced refresh token still gets the token that replaced it. Long
 * enough for a second tab or a retry, short enough that a leaked token used
 * later still ends the session.
 */
const REUSE_GRACE_SECONDS = 60;

const secretAfter = (sessionId: string, secret: string) =>
  hmacSha256(coreKey('erxes-customer-refresh-v1'), `${sessionId}.${secret}`, 'base64url');

/** Who a session signs in: the account, its website and its customer. */
export interface CustomerSessionRef {
  orgId: string;
  customerId: string;
  accountId: string;
  websiteId: string;
  sessionId: string;
}

/** A 15-minute access token for core's `/customer/*` and every plugin's API. */
const customerAccessToken = (ref: CustomerSessionRef) =>
  signJwt(
    { org: ref.orgId, wid: ref.websiteId, sid: ref.sessionId },
    {
      typ: CUSTOMER_ACCESS_TYP,
      audience: CUSTOMER_AUDIENCE,
      subject: ref.customerId,
      expiresInSeconds: CUSTOMER_ACCESS_SECONDS,
    },
  );

/**
 * A 5-minute access token for an agent talking to a website's customer: the website's plugin
 * routes take it as the customer's own (`sid` names the agent, not a session).
 */
export const agentCustomerToken = (
  customer: Pick<CustomerSessionRef, 'orgId' | 'customerId' | 'websiteId'>,
  agentId: string,
) =>
  signJwt(
    { org: customer.orgId, wid: customer.websiteId, sid: `agent:${agentId}` },
    {
      typ: CUSTOMER_ACCESS_TYP,
      audience: CUSTOMER_AUDIENCE,
      subject: customer.customerId,
      expiresInSeconds: 300,
    },
  );

const tokensFor = async (
  ref: CustomerSessionRef,
  refreshToken: string,
): Promise<CustomerTokens> => ({
  accessToken: await customerAccessToken(ref),
  refreshToken,
  expiresIn: CUSTOMER_ACCESS_SECONDS,
});

/** A new session for the account (90 days from its last use) and its first tokens. */
export const createSession = async (
  tx: Db,
  session: Omit<CustomerSessionRef, 'sessionId'> & {
    userAgent?: string | null;
    ip?: string | null;
  },
) => {
  const id = newId();
  const secret = newSecret();

  await tx.insert(customerSessions).values({
    id,
    accountId: session.accountId,
    tokenHash: sha256(secret),
    userAgent: session.userAgent?.slice(0, 500) ?? null,
    ip: session.ip ?? null,
    expiresAt: sql`now() + make_interval(days => ${SESSION_DAYS})`,
  });

  return tokensFor({ ...session, sessionId: id }, `${id}.${secret}`);
};

/** The session a refresh token names (any organisation: the token is all a caller has). */
export const sessionOf = async (token: string | undefined) => {
  const { id, secret } = splitCredential(token);

  if (!id || !secret) return null;

  const [row] = await withSystem('customer session lookup', (tx) =>
    tx
      .select({
        id: customerSessions.id,
        orgId: customerSessions.orgId,
        accountId: customerSessions.accountId,
        websiteId: customerAccounts.websiteId,
        tokenHash: customerSessions.tokenHash,
        previousTokenHash: customerSessions.previousTokenHash,
      })
      .from(customerSessions)
      .innerJoin(customerAccounts, eq(customerAccounts.id, customerSessions.accountId))
      .where(eq(customerSessions.id, id))
      .limit(1),
  );

  return row ? { row, secret } : null;
};

type FoundSession = NonNullable<Awaited<ReturnType<typeof sessionOf>>>;

/**
 * Trades the session's refresh token for new tokens. The previous token used
 * again within REUSE_GRACE_SECONDS gets the same new token, since a second tab
 * or a retried request (its answer lost) refreshes that way. Used again later,
 * it leaked: the session ends.
 */
export const rotateSession = ({ row, secret }: FoundSession) =>
  withOrg(row.orgId, async (tx) => {
    // One refresh at a time per session: a concurrent one waits here and then sees this one's result.
    const [session] = await tx
      .select({
        tokenHash: customerSessions.tokenHash,
        previousTokenHash: customerSessions.previousTokenHash,
        customerId: customerAccounts.customerId,
        live: sql<boolean>`${customerSessions.revokedAt} is null and ${customerSessions.expiresAt} > now()`,
        justRotated: sql<boolean>`coalesce(${customerSessions.rotatedAt} > now() - make_interval(secs => ${REUSE_GRACE_SECONDS}), false)`,
      })
      .from(customerSessions)
      .innerJoin(customerAccounts, eq(customerAccounts.id, customerSessions.accountId))
      .where(eq(customerSessions.id, row.id))
      .for('update', { of: customerSessions })
      .limit(1);

    if (!session?.live) return null;

    const ref = {
      orgId: row.orgId,
      customerId: session.customerId,
      accountId: row.accountId,
      websiteId: row.websiteId,
      sessionId: row.id,
    };

    if (sameHash(session.tokenHash, secret)) {
      const next = secretAfter(row.id, secret);

      await tx
        .update(customerSessions)
        .set({
          tokenHash: sha256(next),
          previousTokenHash: session.tokenHash,
          rotatedAt: sql`now()`,
          lastUsedAt: sql`now()`,
          expiresAt: sql`now() + make_interval(days => ${SESSION_DAYS})`,
        })
        .where(eq(customerSessions.id, row.id));

      return tokensFor(ref, `${row.id}.${next}`);
    }

    if (!session.previousTokenHash || !sameHash(session.previousTokenHash, secret)) return null;

    if (session.justRotated) {
      return tokensFor(ref, `${row.id}.${secretAfter(row.id, secret)}`);
    }

    await tx
      .update(customerSessions)
      .set({ revokedAt: sql`now()` })
      .where(eq(customerSessions.id, row.id));

    return null;
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
  wid: z.string().min(1),
  sid: z.string().min(1),
});

/** The account behind an access token, while its session lasts (signing out ends it here at once). */
export const customerOfToken = async (token: string): Promise<CustomerSessionRef | null> => {
  const claims = await verifyJwt(token, AccessClaims, {
    typ: CUSTOMER_ACCESS_TYP,
    audience: CUSTOMER_AUDIENCE,
  }).catch(() => null);

  if (!claims) return null;

  const [session] = await withOrg(claims.org, (tx) =>
    tx
      .select({ accountId: customerAccounts.id })
      .from(customerSessions)
      .innerJoin(customerAccounts, eq(customerAccounts.id, customerSessions.accountId))
      .where(
        and(
          eq(customerSessions.id, claims.sid),
          eq(customerAccounts.customerId, claims.sub),
          eq(customerAccounts.websiteId, claims.wid),
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
        accountId: session.accountId,
        websiteId: claims.wid,
        sessionId: claims.sid,
      }
    : null;
};
