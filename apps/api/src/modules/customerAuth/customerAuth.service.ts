import type { CustomerTokens } from '@erxes/core-contract';
import {
  customerAccounts,
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
import { type Address, addressOf, invalidCode, sendCode, useCode } from './customerCodes';
import { profileOf } from './customerFields';
import { findLogin } from './customerLogins';
import { createSession, revokeSessionToken, rotateSession, sessionOf } from './customerSessions';
import { type LiveWebsite, websiteFor, websiteServes } from './customerWebsites';

/** Where a sign-in call comes from: a browser sends its page's origin; a mobile app or server, none. */
export interface SignInRequest {
  origin?: string;
}

/** The customer's account on the website, made the first time. */
export const accountOf = async (tx: Db, websiteId: string, customerId: string) => {
  const [found] = await tx
    .select({ id: customerAccounts.id })
    .from(customerAccounts)
    .where(
      and(eq(customerAccounts.websiteId, websiteId), eq(customerAccounts.customerId, customerId)),
    )
    .limit(1);

  if (found) return { ...found, signedUp: false };

  const [made] = await tx
    .insert(customerAccounts)
    .values({ id: newId(), websiteId, customerId })
    .returning({ id: customerAccounts.id });

  if (!made) throw new Error('the account was not saved');

  return { ...made, signedUp: true };
};

/**
 * A new session for the account that proved the address, with its tokens; `signedUp`
 * publishes `core.customer.signed_up` too. Runs as core: nobody is signed in yet.
 */
export const openSession = async (
  tx: Db,
  website: LiveWebsite,
  address: Address,
  account: { accountId: string; customerId: string; signedUp: boolean; created: boolean },
) => {
  const { accountId, customerId } = account;

  await tx
    .update(customerAccounts)
    .set({ lastSignedInAt: sql`now()` })
    .where(eq(customerAccounts.id, accountId));

  const { ip, userAgent } = requestInfo();

  const tokens = await createSession(tx, {
    orgId: website.orgId,
    customerId,
    accountId,
    websiteId: website.id,
    userAgent,
    ip,
  });

  const subject = { subjectType: 'customer' as const, subjectId: customerId };
  const payload = { kind: address.kind, websiteId: website.id };

  await publishCoreEvents(tx, [
    ...(account.signedUp ? [{ type: 'core.customer.signed_up', ...subject, payload }] : []),
    { type: 'core.customer.signed_in', ...subject, payload },
  ]);

  return { ...tokens, customer: await profileOf(tx, customerId), created: account.created };
};

/**
 * Sends a sign-in code for an account on the website. An address with no account gets none,
 * with the same answer, so nobody learns who has one: the website offers sign-up instead.
 */
export const sendSignInCode = async (
  input: Address & { website: string },
  request: SignInRequest,
) => {
  const website = await websiteFor(input.website, request.origin);
  const address = addressOf(input);

  return withOrg(website.orgId, async (tx) =>
    sendCode(tx, website, address, 'sign_in', {
      ip: requestInfo().ip,
      deliver: Boolean(await findLogin(tx, website.id, address)),
    }),
  );
};

/** Signs in to the website's account with a code: a new session, and its tokens. */
export const signInWithCode = async (
  input: Address & { website: string; code: string },
  request: SignInRequest,
) => {
  const website = await websiteFor(input.website, request.origin);
  const address = addressOf(input);

  // Its own transaction: a wrong try counts even though this call fails.
  const valid = await withOrg(website.orgId, (tx) =>
    useCode(tx, website.id, address, 'sign_in', input.code),
  );

  if (!valid) throw invalidCode();

  return withOrg(website.orgId, (tx) =>
    runAs(system('customer sign-in'), async () => {
      const login = await findLogin(tx, website.id, address);

      // The login went after the code was sent (removed, or merged away).
      if (!login) throw invalidCode();

      await tx
        .update(customerLogins)
        .set({ lastUsedAt: sql`now()` })
        .where(eq(customerLogins.id, login.id));

      return openSession(tx, website, address, {
        accountId: login.accountId,
        customerId: login.customerId,
        signedUp: false,
        created: false,
      });
    }),
  );
};

const invalidToken = () => fail('INVALID_TOKEN', 'The refresh token is not valid: sign in again');

/** New tokens for the website's refresh token, while the website still signs customers in. */
export const refreshTokens = async (
  input: { refreshToken: string },
  request: SignInRequest,
): Promise<CustomerTokens> => {
  const found = await sessionOf(input.refreshToken);

  if (!found || !(await websiteServes(found.row.websiteId, request.origin))) throw invalidToken();

  const tokens = await rotateSession(found);

  if (!tokens) throw invalidToken();

  return tokens;
};

export const signOut = async (refreshToken: string) => {
  await revokeSessionToken(refreshToken);

  return { ok: true as const };
};
