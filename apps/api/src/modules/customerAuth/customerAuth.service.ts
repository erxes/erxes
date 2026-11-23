import type { CustomerTokens } from '@erxes/core-contract';
import {
  customerAccounts,
  type CustomerLoginKind,
  customerLogins,
  type Db,
  newId,
  runAs,
  system,
  withOrg,
} from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { requestInfo } from '~/http/requestContext';
import { publishCoreEvents } from '~/modules/events/events.service';
import { issueCode, proveCode } from './customerCodeReplies';
import { type Address, addressOf, invalidCode } from './customerCodes';
import { profileOf } from './customerFields';
import { findLogin } from './customerLogins';
import { createSession, revokeSessionToken, rotateSession, sessionOf } from './customerSessions';
import { type LivePortal, portalFor, portalServes } from './customerPortals';

/** Where a sign-in call comes from: a browser sends its page's origin; a mobile app or server, none. */
export interface SignInRequest {
  origin?: string;
}

/** The customer's account on the portal, made the first time. */
export const accountOf = async (tx: Db, portalId: string, customerId: string) => {
  const [found] = await tx
    .select({ id: customerAccounts.id })
    .from(customerAccounts)
    .where(
      and(eq(customerAccounts.portalId, portalId), eq(customerAccounts.customerId, customerId)),
    )
    .limit(1);

  if (found) return { ...found, signedUp: false };

  const [made] = await tx
    .insert(customerAccounts)
    .values({ id: newId(), portalId, customerId })
    .returning({ id: customerAccounts.id });

  if (!made) throw new Error('the account was not saved');

  return { ...made, signedUp: true };
};

/**
 * A new session for the account that proved itself (by `kind`: an address's code, Google, …),
 * with its tokens; `signedUp` publishes `core.customer.signed_up` too. Runs as core: nobody is
 * signed in yet.
 */
export const openSession = async (
  tx: Db,
  portal: Pick<LivePortal, 'id' | 'orgId'>,
  kind: CustomerLoginKind,
  account: { accountId: string; customerId: string; signedUp: boolean; created: boolean },
) => {
  const { accountId, customerId } = account;

  await tx
    .update(customerAccounts)
    .set({ lastSignedInAt: sql`now()` })
    .where(eq(customerAccounts.id, accountId));

  const { ip, userAgent } = requestInfo();

  const tokens = await createSession(tx, {
    orgId: portal.orgId,
    customerId,
    accountId,
    portalId: portal.id,
    userAgent,
    ip,
  });

  const subject = { subjectType: 'customer' as const, subjectId: customerId };
  const payload = { kind, portalId: portal.id };

  await publishCoreEvents(tx, [
    ...(account.signedUp ? [{ type: 'core.customer.signed_up', ...subject, payload }] : []),
    { type: 'core.customer.signed_in', ...subject, payload },
  ]);

  return { ...tokens, customer: await profileOf(tx, customerId), created: account.created };
};

/**
 * Sends a sign-in code for an account on the portal. An address with no account gets none,
 * with the same answer, so nobody learns who has one: the portal offers sign-up instead.
 */
export const sendSignInCode = async (
  input: Address & { portal: string },
  request: SignInRequest,
) => {
  const portal = await portalFor(input.portal, request.origin);
  const address = addressOf(input);
  const { ip } = requestInfo();

  return issueCode(portal, address, 'sign_in', async (tx) => ({
    ip,
    deliver: Boolean(await findLogin(tx, portal.id, address)),
  }));
};

const noAccount = () =>
  fail('NO_ACCOUNT', 'This phone has no account on the portal: sign up with it');

/** Signs in to the portal's account with a code: a new session, and its tokens. */
export const signInWithCode = async (
  input: Address & { portal: string; code: string },
  request: SignInRequest,
) => {
  const portal = await portalFor(input.portal, request.origin);
  const address = addressOf(input);
  const used = await proveCode(portal, address, 'sign_in', input.code);

  return withOrg(portal.orgId, (tx) =>
    runAs(system('customer sign-in'), async () => {
      const login = await findLogin(tx, portal.id, address);

      // A texted code proved the phone, which has no account; or the login went after the code
      // was sent (removed, or merged away).
      if (!login) throw used.replySessionId ? noAccount() : invalidCode();

      await tx
        .update(customerLogins)
        .set({ lastUsedAt: sql`now()` })
        .where(eq(customerLogins.id, login.id));

      return openSession(tx, portal, address.kind, {
        accountId: login.accountId,
        customerId: login.customerId,
        signedUp: false,
        created: false,
      });
    }),
  );
};

const invalidToken = () => fail('INVALID_TOKEN', 'The refresh token is not valid: sign in again');

/** New tokens for the portal's refresh token, while the portal still signs customers in. */
export const refreshTokens = async (
  input: { refreshToken: string },
  request: SignInRequest,
): Promise<CustomerTokens> => {
  const found = await sessionOf(input.refreshToken);

  if (!found || !(await portalServes(found.row.portalId, request.origin))) throw invalidToken();

  const tokens = await rotateSession(found);

  if (!tokens) throw invalidToken();

  return tokens;
};

export const signOut = async (refreshToken: string) => {
  await revokeSessionToken(refreshToken);

  return { ok: true as const };
};
