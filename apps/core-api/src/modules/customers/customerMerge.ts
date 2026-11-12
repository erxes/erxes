import { customerCompanies, customers, type Db, withTransaction } from '@erxes/core-db';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { type Actor, requirePermission } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { combineContacts, combineCustomFields, fillEmpty } from '~/lib/merge';
import { contactsMerged } from '~/modules/activities/contactHistory';
import { saveCustomFields } from '~/modules/fields/fieldValues';
import { copyTags } from '~/modules/tags/tagLinks';
import { type CustomerRow, findCustomer, inOrg, selectCustomers, toCustomerDto } from './customerRows';

const MERGE_FILLED = [
  'firstName',
  'middleName',
  'lastName',
  'avatarUrl',
  'sex',
  'birthDate',
  'position',
  'department',
  'code',
  'description',
  'ownerId',
] as const;

/** Company links and tags move to the kept customer before the others go. */
const moveRelations = async (tx: Db, orgId: string, keepId: string, otherIds: string[]) => {
  await tx.execute(sql`
    INSERT INTO ${customerCompanies} (org_id, customer_id, company_id)
    SELECT ${orgId}, ${keepId}, company_id FROM ${customerCompanies}
    WHERE customer_id IN (${sql.join(
      otherIds.map((id) => sql`${id}`),
      sql`, `,
    )})
    ON CONFLICT DO NOTHING
  `);
  await copyTags(tx, orgId, 'customer', otherIds, keepId);
};

/** The kept customer's columns after the merge. */
const mergedColumns = (keep: CustomerRow, others: CustomerRow[]) => {
  const email = combineContacts(
    { primary: keep.primaryEmail, list: keep.emails },
    others.map((other) => ({ primary: other.primaryEmail, list: other.emails })),
  );

  const phone = combineContacts(
    { primary: keep.primaryPhone, list: keep.phones },
    others.map((other) => ({ primary: other.primaryPhone, list: other.phones })),
  );

  return {
    ...fillEmpty(keep, others, MERGE_FILLED),
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
 * Merges customers into `keepId`: its empty fields are filled from the others
 * (in the given order), emails, phones, tags and companies are combined,
 * custom field values are added where it has none, and the others are deleted.
 * Their ids keep resolving to the kept customer (`mergedIds`).
 */
export const mergeCustomers = async (actor: Actor, input: { ids: string[]; keepId: string }) => {
  requirePermission(actor, 'contacts.merge');

  const ids = unique(input.ids);

  if (ids.length < 2) {
    throw new HttpError(400, 'INVALID_INPUT', 'Choose at least two customers to merge');
  }

  return withTransaction(async (tx) => {
    const rows = await selectCustomers(tx)
      .where(and(eq(customers.orgId, actor.orgId), inArray(customers.id, ids)))
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

    await moveRelations(tx, actor.orgId, keep.id, otherIds);
    // Deleting first frees their primary email and phone for the kept customer.
    await tx
      .delete(customers)
      .where(and(eq(customers.orgId, actor.orgId), inArray(customers.id, otherIds)));

    await tx
      .update(customers)
      .set(mergedColumns(keep, others))
      .where(inOrg(actor.orgId, keep.id));

    const combined = combineCustomFields(
      keep.customFields,
      others.map((other) => other.customFields),
    );

    await saveCustomFields(tx, actor.orgId, 'customer', keep.id, combined, Object.keys(combined));

    const merged = await findCustomer(tx, actor.orgId, keep.id);

    await contactsMerged(tx, actor, 'customer', merged, others);

    return toCustomerDto(merged);
  });
};
