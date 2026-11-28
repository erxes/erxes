import {
  customerAccounts,
  type CustomerLoginKind,
  customerLogins,
  customers,
  type Db,
  newId,
  requestOrgId,
} from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { lockKeys } from '~/lib/locks';
import type { Address } from './customerCodes';

/** What a login signs in with: an address, or an account at Google, Apple or Facebook (its id). */
export interface Login {
  kind: CustomerLoginKind;
  value: string;
}

const isAddress = (login: Login): login is Address =>
  login.kind === 'email' || login.kind === 'phone';

/** One sign-up per login and portal at a time (advisory locks span organisations). */
export const lockLogin = (tx: Db, portalId: string, address: Login) =>
  lockKeys(tx, [`customer-login:${requestOrgId()}:${portalId}:${address.kind}:${address.value}`]);

/** The login on a portal, with its account. */
export const findLogin = (tx: Db, portalId: string, address: Login) =>
  tx
    .select({
      id: customerLogins.id,
      accountId: customerAccounts.id,
      customerId: customerAccounts.customerId,
    })
    .from(customerLogins)
    .innerJoin(customerAccounts, eq(customerAccounts.id, customerLogins.accountId))
    .where(
      and(
        eq(customerLogins.portalId, portalId),
        eq(customerLogins.kind, address.kind),
        eq(customerLogins.value, address.value),
      ),
    )
    .limit(1)
    .then(([row]) => row);

/**
 * Adds a proven login to the account; an address goes to its customer's emails or phones too.
 */
export const addLogin = async (
  tx: Db,
  account: { id: string; portalId: string; customerId: string },
  address: Login,
) => {
  const [row] = await tx
    .insert(customerLogins)
    .values({
      id: newId(),
      accountId: account.id,
      portalId: account.portalId,
      kind: address.kind,
      value: address.value,
    })
    .returning();

  if (!row) throw new Error('the login was not saved');

  if (!isAddress(address)) return row;

  const list = address.kind === 'email' ? customers.emails : customers.phones;
  const primary = address.kind === 'email' ? customers.primaryEmail : customers.primaryPhone;

  await tx
    .update(customers)
    .set(
      address.kind === 'email'
        ? {
            emails: sql`case when ${address.value} = any(${list}) then ${list} else array_append(${list}, ${address.value}) end`,
            primaryEmail: sql`coalesce(${primary}, ${address.value})`,
          }
        : {
            phones: sql`case when ${address.value} = any(${list}) then ${list} else array_append(${list}, ${address.value}) end`,
            primaryPhone: sql`coalesce(${primary}, ${address.value})`,
          },
    )
    .where(eq(customers.id, account.customerId));

  return row;
};
