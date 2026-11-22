import type { CustomerProfile } from '@erxes/core-contract';
import {
  caller,
  customerLogins,
  customers,
  customerSessions,
  type Db,
  requestOrgId,
  websites,
  withOrg,
} from '@erxes/core-db';
import { and, asc, desc, eq, getTableColumns, gt, isNull, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { requestInfo } from '~/http/requestContext';
import { wholeList } from '~/lib/keyset';
import { lockKeys } from '~/lib/locks';
import { contactUpdated } from '~/modules/activities/contactHistory';
import { findCustomer } from '~/modules/customers/customerRows';
import { type Address, addressOf, invalidCode, sendCode, useCode } from './customerCodes';
import { addLogin, findLogin, lockLogin } from './customerLogins';

// The signed-in customer (`caller('customer')`): their profile, and their account on the website.

export const myProfile = () =>
  withOrg(requestOrgId(), (tx) => findCustomer(tx, caller('customer').customerId));

export const updateMyProfile = (
  changes: Partial<Pick<CustomerProfile, 'firstName' | 'lastName' | 'avatarUrl' | 'birthDate'>>,
) =>
  withOrg(requestOrgId(), async (tx) => {
    const { customerId } = caller('customer');
    const before = await findCustomer(tx, customerId);

    await tx
      .update(customers)
      .set({ ...changes, updatedAt: sql`now()` })
      .where(eq(customers.id, customerId));

    const after = await findCustomer(tx, customerId);

    await contactUpdated(tx, 'customer', before, after);

    return after;
  });

/** The signed-in account's logins. */
const myLoginRows = () => eq(customerLogins.accountId, caller('customer').accountId);

export const myLogins = () =>
  withOrg(requestOrgId(), async (tx) => ({
    data: await wholeList((limit) =>
      tx
        .select()
        .from(customerLogins)
        .where(myLoginRows())
        .orderBy(asc(customerLogins.createdAt))
        .limit(limit),
    ),
  }));

/** The website the signed-in account belongs to. */
const myWebsite = async (tx: Db) => {
  const [website] = await tx
    .select({ id: websites.id, name: websites.name })
    .from(websites)
    .where(eq(websites.id, caller('customer').websiteId))
    .limit(1);

  if (!website) throw notFound('Website');

  return website;
};

/**
 * Sends a code to a new address for the account. An address another account
 * signs in with gets no code, with the same answer, so nobody learns it is taken.
 */
export const sendAddLoginCode = (input: Address) =>
  withOrg(requestOrgId(), async (tx) => {
    const address = addressOf(input);
    const website = await myWebsite(tx);
    const taken = Boolean(await findLogin(tx, website.id, address));

    return sendCode(tx, website, address, 'add_login', {
      accountId: caller('customer').accountId,
      ip: requestInfo().ip,
      deliver: !taken,
    });
  });

const loginTaken = () =>
  fail('TAKEN', 'Someone already signs in with this address', { field: 'value' });

export const confirmAddLogin = async (input: Address & { code: string }) => {
  const { accountId, websiteId, customerId } = caller('customer');
  const address = addressOf(input);

  const valid = await withOrg(requestOrgId(), (tx) =>
    useCode(tx, websiteId, address, 'add_login', input.code, accountId),
  );

  if (!valid) throw invalidCode();

  return withOrg(requestOrgId(), async (tx) => {
    await lockLogin(tx, websiteId, address);

    if (await findLogin(tx, websiteId, address)) throw loginTaken();

    return addLogin(tx, { id: accountId, websiteId, customerId }, address);
  });
};

export const removeMyLogin = (id: string) =>
  withOrg(requestOrgId(), async (tx) => {
    const { accountId } = caller('customer');

    // One removal at a time per account: two at once can't remove the last two.
    await lockKeys(tx, [`customer-logins:${requestOrgId()}:${accountId}`]);

    const mine = await tx
      .select({ id: customerLogins.id })
      .from(customerLogins)
      .where(myLoginRows());

    if (!mine.some((login) => login.id === id)) throw notFound('Login');

    if (mine.length === 1) {
      throw fail('LAST_LOGIN', 'Add another address before removing your last one');
    }

    await tx.delete(customerLogins).where(eq(customerLogins.id, id));

    return { ok: true as const };
  });

/** The signed-in account's live sessions. */
const activeSessions = () =>
  and(
    eq(customerSessions.accountId, caller('customer').accountId),
    isNull(customerSessions.revokedAt),
    gt(customerSessions.expiresAt, sql`now()`),
  );

export const mySessions = () =>
  withOrg(requestOrgId(), async (tx) => ({
    data: await wholeList((limit) =>
      tx
        .select({
          ...getTableColumns(customerSessions),
          current: sql<boolean>`${customerSessions.id} = ${caller('customer').sessionId}`,
        })
        .from(customerSessions)
        .where(activeSessions())
        .orderBy(desc(customerSessions.lastUsedAt))
        .limit(limit),
    ),
  }));

export const revokeMySession = (id: string) =>
  withOrg(requestOrgId(), async (tx) => {
    const [revoked] = await tx
      .update(customerSessions)
      .set({ revokedAt: sql`now()` })
      .where(and(activeSessions(), eq(customerSessions.id, id)))
      .returning({ id: customerSessions.id });

    if (!revoked) throw notFound('Session');

    return { ok: true as const };
  });

export const signOutEverywhere = () =>
  withOrg(requestOrgId(), async (tx) => {
    await tx
      .update(customerSessions)
      .set({ revokedAt: sql`now()` })
      .where(activeSessions());

    return { ok: true as const };
  });
