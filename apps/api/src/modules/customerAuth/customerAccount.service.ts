import type { CustomerProfile } from '@erxes/core-contract';
import {
  caller,
  customerLogins,
  customerSessions,
  type CustomValue,
  requestOrgId,
  portals,
  withOrg,
} from '@erxes/core-db';
import { and, asc, desc, eq, getTableColumns, gt, isNull, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { requestInfo } from '~/http/requestContext';
import { wholeList } from '~/lib/keyset';
import { lockKeys } from '~/lib/locks';
import { findCustomer } from '~/modules/customers/customerRows';
import { updateCustomer } from '~/modules/customers/customers.service';
import { issueCode, proveCode } from './customerCodeReplies';
import { type Address, addressOf } from './customerCodes';
import { checkTheirFields, profileOf } from './customerFields';
import { addLogin, findLogin, lockLogin } from './customerLogins';

// The signed-in customer (`caller('customer')`): their profile, and their account on the portal.

export const myProfile = () =>
  withOrg(requestOrgId(), (tx) => profileOf(tx, caller('customer').customerId));

/** Their name, picture, birth date and the fields customers fill in; nothing staff keep. */
export const updateMyProfile = (
  changes: Partial<Pick<CustomerProfile, 'firstName' | 'lastName' | 'avatarUrl' | 'birthDate'>> & {
    customFields?: Record<string, CustomValue | null>;
  },
) =>
  withOrg(requestOrgId(), async (tx) => {
    const { customerId } = caller('customer');
    const { customFields, ...own } = changes;

    if (customFields) {
      await checkTheirFields(tx, (await findCustomer(tx, customerId)).customFields, customFields);
    }

    await updateCustomer(tx, customerId, { ...own, ...(customFields && { customFields }) });

    return profileOf(tx, customerId);
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

/** The portal the signed-in account belongs to, with how its codes go. */
const myPortal = () =>
  withOrg(requestOrgId(), async (tx) => {
    const [portal] = await tx
      .select()
      .from(portals)
      .where(eq(portals.id, caller('customer').portalId))
      .limit(1);

    if (!portal) throw notFound('Portal');

    return portal;
  });

/**
 * Sends a code to a new address for the account. An address another account
 * signs in with gets no code, with the same answer, so nobody learns it is taken.
 */
export const sendAddLoginCode = async (input: Address) => {
  const address = addressOf(input);
  const portal = await myPortal();
  const { ip } = requestInfo();
  const { accountId } = caller('customer');

  return issueCode(portal, address, 'add_login', async (tx) => ({
    accountId,
    ip,
    deliver: !(await findLogin(tx, portal.id, address)),
  }));
};

const loginTaken = () =>
  fail('TAKEN', 'Someone already signs in with this address', { field: 'value' });

export const confirmAddLogin = async (input: Address & { code: string }) => {
  const { accountId, portalId, customerId } = caller('customer');
  const address = addressOf(input);

  await proveCode(await myPortal(), address, 'add_login', input.code, accountId);

  return withOrg(requestOrgId(), async (tx) => {
    await lockLogin(tx, portalId, address);

    if (await findLogin(tx, portalId, address)) throw loginTaken();

    return addLogin(tx, { id: accountId, portalId, customerId }, address);
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
