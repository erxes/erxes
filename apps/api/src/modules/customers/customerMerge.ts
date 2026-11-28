import {
  broadcastRecipients,
  customerAccounts,
  customerCodes,
  customerCompanies,
  customerLogins,
  customerNotifications,
  customers,
  customerSessions,
  db,
  type Db,
} from '@erxes/core-db';
import type { CustomerMerge } from '@erxes/core-contract';
import { CUSTOMER_MERGE_FIELDS } from '@erxes/core-db/enums';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { combineContacts, combineCustomFields, pickedRow, pickFields } from '~/lib/merge';
import { contactsMerged } from '~/modules/activities/contactHistory';
import { mergeHostValues } from '~/modules/dataExtensions/hostRecords';
import { saveCustomFields } from '~/modules/fields/fieldValues';
import { copyTags } from '~/modules/tags/tagLinks';
import { type CustomerRow, findCustomer, inOrg, selectCustomers } from './customerRows';

/** Fields taken whole from one customer; emails and phones are combined. */
const MERGE_FILLED = CUSTOMER_MERGE_FIELDS.filter(
  (field) => field !== 'primaryEmail' && field !== 'primaryPhone',
);

/**
 * Accounts move to the kept customer. Where the kept customer already has an
 * account on the same portal, the other account's logins and sessions join
 * it and the other account goes.
 */
const moveAccounts = async (tx: Db, otherIds: string[], keepId: string) => {
  const others = await tx
    .select({ id: customerAccounts.id, portalId: customerAccounts.portalId })
    .from(customerAccounts)
    .where(inArray(customerAccounts.customerId, otherIds))
    .orderBy(asc(customerAccounts.createdAt), asc(customerAccounts.id));

  await inOrder(others, async (other) => {
    const [kept] = await tx
      .select({ id: customerAccounts.id })
      .from(customerAccounts)
      .where(
        and(eq(customerAccounts.portalId, other.portalId), eq(customerAccounts.customerId, keepId)),
      )
      .limit(1);

    if (!kept) {
      await tx
        .update(customerAccounts)
        .set({ customerId: keepId })
        .where(eq(customerAccounts.id, other.id));

      return;
    }

    await tx
      .update(customerLogins)
      .set({ accountId: kept.id })
      .where(eq(customerLogins.accountId, other.id));
    await tx
      .update(customerSessions)
      .set({ accountId: kept.id })
      .where(eq(customerSessions.accountId, other.id));
    await tx
      .update(customerCodes)
      .set({ accountId: kept.id })
      .where(eq(customerCodes.accountId, other.id));
    await tx.delete(customerAccounts).where(eq(customerAccounts.id, other.id));
  });
};

/** Company links and tags move to the kept customer before the others go. */
const moveRelations = async (tx: Db, keepId: string, otherIds: string[]) => {
  await tx.execute(sql`
    INSERT INTO ${customerCompanies} (customer_id, company_id)
    SELECT ${keepId}, company_id FROM ${customerCompanies}
    WHERE customer_id IN (${sql.join(
      otherIds.map((id) => sql`${id}`),
      sql`, `,
    )})
    ON CONFLICT DO NOTHING
  `);
  await copyTags(tx, 'customer', otherIds, keepId);

  // They sign in as the kept customer from now on, and stay signed in.
  await moveAccounts(tx, otherIds, keepId);
  // Their inboxes too; a retry key both had keeps the kept customer's copy.
  await tx.execute(sql`
    DELETE FROM ${customerNotifications} other
    USING ${customerNotifications} kept
    WHERE other.customer_id IN (${sql.join(
      otherIds.map((id) => sql`${id}`),
      sql`, `,
    )})
      AND kept.customer_id = ${keepId} AND kept.dedupe_key = other.dedupe_key
  `);
  await tx
    .update(customerNotifications)
    .set({ customerId: keepId })
    .where(inArray(customerNotifications.customerId, otherIds));
  // What broadcasts they were sent stays counted, now as the kept customer's.
  await tx
    .update(broadcastRecipients)
    .set({ customerId: keepId })
    .where(inArray(broadcastRecipients.customerId, otherIds));
};

/** The kept customer's columns after the merge. */
const mergedColumns = (
  keep: CustomerRow,
  others: CustomerRow[],
  picks: CustomerMerge['fields'],
) => {
  const email = combineContacts(
    { primary: keep.primaryEmail, list: keep.emails },
    others.map((other) => ({ primary: other.primaryEmail, list: other.emails })),
    pickedRow(keep, others, picks.primaryEmail).primaryEmail,
  );

  const phone = combineContacts(
    { primary: keep.primaryPhone, list: keep.phones },
    others.map((other) => ({ primary: other.primaryPhone, list: other.phones })),
    pickedRow(keep, others, picks.primaryPhone).primaryPhone,
  );

  return {
    ...pickFields(keep, others, MERGE_FILLED, picks),
    state: [keep, ...others].some((row) => row.state === 'customer')
      ? ('customer' as const)
      : ('lead' as const),
    primaryEmail: email.primary,
    emails: email.list,
    primaryPhone: phone.primary,
    phones: phone.list,
    mergedIds: unique([
      ...keep.mergedIds,
      ...others.map((other) => other.id),
      ...others.flatMap((other) => other.mergedIds),
    ]),
    updatedAt: sql`now()`,
  };
};

/**
 * Merges customers into `keepId`: each field in `fields` takes the value of
 * the customer picked for it, other empty fields are filled from the others
 * (in the given order), emails, phones, tags and companies are combined,
 * custom field values are added where it has none, and the others are deleted.
 * Their ids keep resolving to the kept customer (`mergedIds`).
 */
export const mergeCustomers = async (input: CustomerMerge) => {
  const ids = unique(input.ids);

  if (ids.length < 2) {
    throw fail('INVALID_INPUT', 'Choose at least two customers to merge', {
      issues: [{ path: ['ids'], message: 'Choose at least two customers to merge' }],
    });
  }

  const tx = db();

  const rows = await selectCustomers(tx)
    .where(inArray(customers.id, ids))
    .orderBy(asc(customers.createdAt))
    .for('update');

  const byId = new Map(rows.map((row) => [row.id, row]));
  const keep = byId.get(input.keepId);

  if (rows.length !== ids.length || !keep) {
    throw notFound('Customer');
  }

  // In the given order: the first other with a value fills an empty field.
  const others = ids.filter((id) => id !== keep.id).flatMap((id) => byId.get(id) ?? []);
  const otherIds = others.map((other) => other.id);

  await moveRelations(tx, keep.id, otherIds);
  await mergeHostValues(tx, 'core.customer', keep.id, otherIds);
  // Deleting first frees their primary email and phone for the kept customer.
  await tx.delete(customers).where(inArray(customers.id, otherIds));

  await tx
    .update(customers)
    .set(mergedColumns(keep, others, input.fields))
    .where(inOrg(keep.id));

  const combined = combineCustomFields(
    keep.customFields,
    others.map((other) => other.customFields),
  );

  await saveCustomFields(tx, 'customer', keep.id, combined, Object.keys(combined));

  const merged = await findCustomer(tx, keep.id);

  await contactsMerged(tx, 'customer', merged, others);

  return merged;
};
