import {
  customerAccounts,
  customerLogins,
  customers,
  type Db,
  newId,
  requestOrgId,
} from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { lockKeys } from '~/lib/locks';
import type { Address } from './customerCodes';

/** One sign-up per address and website at a time (advisory locks span organisations). */
export const lockLogin = (tx: Db, websiteId: string, address: Address) =>
  lockKeys(tx, [`customer-login:${requestOrgId()}:${websiteId}:${address.kind}:${address.value}`]);

/** The login an address is on a website, with its account. */
export const findLogin = (tx: Db, websiteId: string, address: Address) =>
  tx
    .select({
      id: customerLogins.id,
      accountId: customerAccounts.id,
      customerId: customerAccounts.customerId,
      status: customerAccounts.status,
    })
    .from(customerLogins)
    .innerJoin(customerAccounts, eq(customerAccounts.id, customerLogins.accountId))
    .where(
      and(
        eq(customerLogins.websiteId, websiteId),
        eq(customerLogins.kind, address.kind),
        eq(customerLogins.value, address.value),
      ),
    )
    .limit(1)
    .then(([row]) => row);

/** Adds a proven address as the account's login, and to its customer's emails or phones. */
export const addLogin = async (
  tx: Db,
  account: { id: string; websiteId: string; customerId: string },
  address: Address,
) => {
  const [row] = await tx
    .insert(customerLogins)
    .values({
      id: newId(),
      accountId: account.id,
      websiteId: account.websiteId,
      kind: address.kind,
      value: address.value,
    })
    .returning();

  if (!row) throw new Error('the login was not saved');

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
