import type { CustomerInput } from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import { caller, customerCompanies, customers, newId, savepoint } from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { normalizeEmail, normalizePhone, resolveContacts, unique } from '~/lib/contacts';
import { oneRow } from '~/lib/rows';
import {
  contactCreated,
  contactsLinked,
  contactsRemoved,
  contactsTagged,
  contactUpdated,
} from '~/modules/activities/contactHistory';
import { applyCustomFields } from '~/modules/fields/customValues';
import { saveCustomFields } from '~/modules/fields/fieldValues';
import { changeTags, setRecordTags, tagIdsColumn } from '~/modules/tags/tagLinks';
import { checkTagIds } from '~/modules/tags/tags.service';
import { assertOwner } from '~/lib/guards';
import { lockRows } from '~/lib/locks';
import { guardDeletions } from '~/lib/deletionGuard';
import { moveToTrash } from '~/modules/trash/trash.service';
import { planLeadOnCreate, planLeadOnUpdate, recordLeadSteps } from '~/modules/leads/lifecycle';
import { contactColumns, scalarFields } from './customerColumns';
import { assertCompany } from './customerLinks';
import { conflictFrom, findCustomer, inOrg } from './customerRows';

export const getCustomer = (client: Db, id: string) => findCustomer(client, id, true);

export const createCustomer = async (client: Db, input: CustomerInput) => {
  await assertOwner(client, input.ownerId);

  const none = { primary: null, list: [] };
  const email = resolveContacts(input.primaryEmail, input.emails, none, normalizeEmail);
  const phone = resolveContacts(input.primaryPhone, input.phones, none, normalizePhone);
  const tagIds = await checkTagIds(client, 'customer', input.tagIds ?? []);

  const customFields = await applyCustomFields(client, 'customer', {}, input.customFields);

  const lead = await planLeadOnCreate(client, {
    ...input,
    state: input.state ?? 'customer',
  });

  try {
    const id = await savepoint(async (tx) => {
      const { id: created } = oneRow(
        await tx
          .insert(customers)
          .values({
            ...scalarFields(input),
            id: newId(),
            state: input.state ?? 'customer',
            primaryEmail: email.primary,
            emails: email.list,
            primaryPhone: phone.primary,
            phones: phone.list,
            ...lead.set,
            createdBy: caller('user').userId,
          })
          .returning({ id: customers.id }),
      );

      await saveCustomFields(tx, 'customer', created, customFields, Object.keys(customFields));
      await recordLeadSteps(tx, 'customer', [{ id: created, steps: lead.steps }]);
      await setRecordTags(tx, 'customer', created, tagIds);
      await contactCreated(tx, 'customer', await findCustomer(tx, created));

      return created;
    });

    return await findCustomer(client, id);
  } catch (error) {
    return conflictFrom(client, error, {
      primaryEmail: email.primary,
      primaryPhone: phone.primary,
    });
  }
};

export const updateCustomer = async (client: Db, id: string, input: CustomerInput) => {
  // Custom fields are merged from what is stored: concurrent edits wait, then build on each other.
  await lockRows(client, 'core_customers', [id]);

  const current = await findCustomer(client, id);

  await assertOwner(client, input.ownerId);

  const changes = contactColumns(current, input);

  const tagIds =
    input.tagIds === undefined ? undefined : await checkTagIds(client, 'customer', input.tagIds);

  const customFields =
    input.customFields === undefined
      ? undefined
      : await applyCustomFields(client, 'customer', current.customFields, input.customFields);

  const lead = await planLeadOnUpdate(client, current, input);

  try {
    await savepoint(async (tx) => {
      const updated = await tx
        .update(customers)
        .set({ ...scalarFields(input), ...changes, ...lead.set, updatedAt: sql`now()` })
        .where(inOrg(id))
        .returning({ id: customers.id });

      if (!updated.length) {
        throw notFound('Customer');
      }

      await recordLeadSteps(tx, 'customer', [{ id, steps: lead.steps }]);

      if (customFields) {
        const keys = Object.keys(input.customFields ?? {});

        await saveCustomFields(tx, 'customer', id, customFields, keys);
      }

      if (tagIds) {
        await setRecordTags(tx, 'customer', id, tagIds);
      }

      await contactUpdated(tx, 'customer', current, await findCustomer(tx, id));
    });

    return await findCustomer(client, id);
  } catch (error) {
    return conflictFrom(client, error, {
      primaryEmail: changes.primaryEmail ?? current.primaryEmail,
      primaryPhone: changes.primaryPhone ?? current.primaryPhone,
    });
  }
};

export const removeCustomers = async (
  client: Db,
  ids: string[],
  options: { undoingImport?: boolean } = {},
) => {
  // A runaway deletion is stopped (not an import being undone); what is deleted goes to the recycle bin first.
  if (!options.undoingImport) await guardDeletions(client, ids.length, 'customers');
  await moveToTrash(client, 'customer', ids);

  const rows = await client.delete(customers).where(inArray(customers.id, ids)).returning();

  await contactsRemoved(client, 'customer', rows);

  return { removed: rows.length };
};

const tagsByCustomer = async (client: Db, ids: string[]) => {
  const rows = await client
    .select({ id: customers.id, tagIds: tagIdsColumn('customer', customers.id) })
    .from(customers)
    .where(inArray(customers.id, ids));

  return new Map(rows.map((row) => [row.id, row.tagIds]));
};

/** Adds and removes tags on many customers at once. */
export const tagCustomers = async (
  client: Db,
  input: { ids: string[]; add: string[]; remove: string[] },
) => {
  const add = await checkTagIds(client, 'customer', input.add);

  const before = await tagsByCustomer(client, input.ids);

  const count = await changeTags(client, 'customer', input.ids, {
    add,
    remove: unique(input.remove),
  });

  await contactsTagged(client, 'customer', before, await tagsByCustomer(client, input.ids));

  return { updated: count };
};

interface LinkInput {
  role?: string | null;
  isPrimaryContact?: boolean;
  ended?: boolean;
}

/** Creates or changes the links of people to a company; new links go on both timelines. */
const upsertLinks = async (
  tx: Db,
  ids: string[],
  companyId: string,
  attributes: { role?: string | null; isPrimaryContact?: boolean; endedAt?: Date | null },
) => {
  const rows = await tx
    .insert(customerCompanies)
    .values(ids.map((customerId) => ({ customerId, companyId, ...attributes })))
    .onConflictDoUpdate({
      target: [customerCompanies.customerId, customerCompanies.companyId],
      set: { ...attributes, updatedAt: sql`now()` },
    })
    .returning({ customerId: customerCompanies.customerId, created: sql<boolean>`xmax = 0` });

  await contactsLinked(
    tx,
    rows.filter((row) => row.created).map(({ customerId }) => ({ customerId, companyId })),
    true,
  );
};

/**
 * Links a person and a company, or changes their link: role, main contact
 * (one per company: taking it moves it), left / back. Same from either side.
 */
export const linkCustomerCompany = async (
  client: Db,
  id: string,
  companyId: string,
  input: LinkInput = {},
) => {
  await findCustomer(client, id);
  await assertCompany(client, companyId);

  // Unset keys stay as they are: Drizzle skips undefined in the insert and the conflict update.
  const attributes = {
    role: input.role === undefined ? undefined : input.role?.trim() || null,
    isPrimaryContact: input.isPrimaryContact,
    endedAt: input.ended === undefined ? undefined : input.ended ? new Date() : null,
  };

  // One main contact per company.
  if (input.isPrimaryContact) {
    await client
      .update(customerCompanies)
      .set({ isPrimaryContact: false, updatedAt: sql`now()` })
      .where(
        and(
          eq(customerCompanies.companyId, companyId),
          eq(customerCompanies.isPrimaryContact, true),
          sql`${customerCompanies.customerId} <> ${id}`,
        ),
      );
  }

  await upsertLinks(client, [id], companyId, attributes);

  return { ok: true as const };
};

/** Links people to a company (converted leads), in one insert; a link already there stays as it is. */
export const linkCustomersToCompany = async (tx: Db, ids: string[], companyId: string) => {
  await assertCompany(tx, companyId);
  await upsertLinks(tx, ids, companyId, {});
};

export const unlinkCustomerCompany = async (client: Db, id: string, companyId: string) => {
  await findCustomer(client, id);

  const unlinked = await client
    .delete(customerCompanies)
    .where(and(eq(customerCompanies.customerId, id), eq(customerCompanies.companyId, companyId)))
    .returning({ customerId: customerCompanies.customerId });

  if (unlinked.length) {
    await contactsLinked(client, [{ customerId: id, companyId }], false);
  }

  return { ok: true as const };
};
