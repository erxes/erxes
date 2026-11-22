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
import { findCustomer } from '~/modules/customers/customerRows';
import { findOrCreateCustomer } from '~/modules/customers/findOrCreateCustomer';
import { publishCoreEvents } from '~/modules/events/events.service';
import { type Address, addressOf, invalidCode, sendCode, useCode } from './customerCodes';
import { addLogin, findLogin, lockLogin } from './customerLogins';
import {
  accountBlocked,
  createSession,
  revokeSessionToken,
  rotateSession,
  sessionOf,
} from './customerSessions';
import { websiteFor, websiteServes } from './customerWebsites';

/** Where a sign-in call comes from: a browser sends its page's origin; a mobile app or server, none. */
export interface SignInRequest {
  origin?: string;
}

/** The customer's account on the website, made the first time. */
const accountOf = async (tx: Db, websiteId: string, customerId: string) => {
  const [found] = await tx
    .select({ id: customerAccounts.id, status: customerAccounts.status })
    .from(customerAccounts)
    .where(
      and(eq(customerAccounts.websiteId, websiteId), eq(customerAccounts.customerId, customerId)),
    )
    .limit(1);

  if (found) return { ...found, signedUp: false };

  const [made] = await tx
    .insert(customerAccounts)
    .values({ id: newId(), websiteId, customerId })
    .returning({ id: customerAccounts.id, status: customerAccounts.status });

  if (!made) throw new Error('the account was not saved');

  return { ...made, signedUp: true };
};

/**
 * The account that signs in to the website with this proven address: its
 * login's, else the account of the customer who has the address (made on
 * their first sign-in here), else a new customer's.
 */
const accountForLogin = async (tx: Db, websiteId: string, address: Address) => {
  await lockLogin(tx, websiteId, address);

  const login = await findLogin(tx, websiteId, address);

  if (login) {
    if (login.status === 'blocked') throw accountBlocked();

    await tx
      .update(customerLogins)
      .set({ lastUsedAt: sql`now()` })
      .where(eq(customerLogins.id, login.id));

    return {
      accountId: login.accountId,
      customerId: login.customerId,
      signedUp: false,
      created: false,
    };
  }

  const { customer, created } = await findOrCreateCustomer(tx, {
    ...(address.kind === 'email'
      ? { primaryEmail: address.value }
      : { primaryPhone: address.value }),
    source: 'sign_in',
  });

  const account = await accountOf(tx, websiteId, customer.id);

  if (account.status === 'blocked') throw accountBlocked();

  const saved = await addLogin(tx, { id: account.id, websiteId, customerId: customer.id }, address);

  await tx
    .update(customerLogins)
    .set({ lastUsedAt: sql`now()` })
    .where(eq(customerLogins.id, saved.id));

  return { accountId: account.id, customerId: customer.id, signedUp: account.signedUp, created };
};

/** Sends a sign-in code for the website; the answer is the same whether or not the address has an account. */
export const sendSignInCode = async (
  input: Address & { website: string },
  request: SignInRequest,
) => {
  const website = await websiteFor(input.website, request.origin);

  return withOrg(website.orgId, (tx) =>
    sendCode(tx, website, addressOf(input), 'sign_in', { ip: requestInfo().ip }),
  );
};

/** Signs in (or up) to the website with a code: a new session for the account, and its tokens. */
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

  // Core signs the customer in (or up) on its own: nobody is signed in yet.
  return withOrg(website.orgId, (tx) =>
    runAs(system('customer sign-in'), async () => {
      const { accountId, customerId, signedUp, created } = await accountForLogin(
        tx,
        website.id,
        address,
      );

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
        ...(signedUp ? [{ type: 'core.customer.signed_up', ...subject, payload }] : []),
        { type: 'core.customer.signed_in', ...subject, payload },
      ]);

      return { ...tokens, customer: await findCustomer(tx, customerId), created };
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
