import type { CustomerInput } from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import { customerCompanies, customers, newId } from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { type Actor, requirePermission, userCaller } from '~/http/auth';
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
import { applyCustomFields } from '~/modules/fields/fields.service';
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
import { conflictFrom, findCustomer, inOrg, toCustomerDto } from './customerRows';

export const getCustomer = async (client: Db, orgId: string, id: string) =>
  toCustomerDto(await findCustomer(client, orgId, id, true));

export const createCustomer = async (client: Db, actor: Actor, input: CustomerInput) => {
  await assertOwner(client, actor.orgId, input.ownerId);

  const none = { primary: null, list: [] };
  const email = resolveContacts(input.primaryEmail, input.emails, none, normalizeEmail);
  const phone = resolveContacts(input.primaryPhone, input.phones, none, normalizePhone);
  const tagIds = await checkTagIds(client, actor.orgId, 'customer', input.tagIds ?? []);

  const customFields = await applyCustomFields(
    client,
    actor.orgId,
    'customer',
    {},
    input.customFields,
  );

  const lead = await planLeadOnCreate(client, userCaller(actor), {
    ...input,
    state: input.state ?? 'customer',
  });

  try {
    const id = await client.transaction(async (tx) => {
      const { id: created } = oneRow(
        await tx
          .insert(customers)
          .values({
            ...scalarFields(input),
            id: newId(),
            orgId: actor.orgId,
            state: input.state ?? 'customer',
            primaryEmail: email.primary,
            emails: email.list,
            primaryPhone: phone.primary,
            phones: phone.list,
            ...lead.set,
            createdBy: actor.userId,
          })
          .returning({ id: customers.id }),
      );

      await saveCustomFields(
        tx,
        actor.orgId,
        'customer',
        created,
        customFields,
        Object.keys(customFields),
      );
      await recordLeadSteps(tx, userCaller(actor), 'customer', created, lead.steps);
      await setRecordTags(tx, actor.orgId, 'customer', created, tagIds);
      await contactCreated(tx, actor, 'customer', await findCustomer(tx, actor.orgId, created));

      return created;
    });

    return toCustomerDto(await findCustomer(client, actor.orgId, id));
  } catch (error) {
    return conflictFrom(client, actor.orgId, error, {
      primaryEmail: email.primary,
      primaryPhone: phone.primary,
    });
  }
};

export const updateCustomer = async (
  client: Db,
  actor: Actor,
  id: string,
  input: CustomerInput,
) => {
  // Custom fields are merged from what is stored: concurrent edits wait, then build on each other.
  await lockRows(client, 'core_customers', actor.orgId, [id]);

  const current = await findCustomer(client, actor.orgId, id);

  await assertOwner(client, actor.orgId, input.ownerId);

  const changes = contactColumns(current, input);

  const tagIds =
    input.tagIds === undefined
      ? undefined
      : await checkTagIds(client, actor.orgId, 'customer', input.tagIds);

  const customFields =
    input.customFields === undefined
      ? undefined
      : await applyCustomFields(
          client,
          actor.orgId,
          'customer',
          current.customFields,
          input.customFields,
        );

  const lead = await planLeadOnUpdate(client, userCaller(actor), current, input);

  try {
    await client.transaction(async (tx) => {
      const updated = await tx
        .update(customers)
        .set({ ...scalarFields(input), ...changes, ...lead.set, updatedAt: sql`now()` })
        .where(inOrg(actor.orgId, id))
        .returning({ id: customers.id });

      if (!updated.length) {
        throw notFound('Customer');
      }

      await recordLeadSteps(tx, userCaller(actor), 'customer', id, lead.steps);

      if (customFields) {
        const keys = Object.keys(input.customFields ?? {});

        await saveCustomFields(tx, actor.orgId, 'customer', id, customFields, keys);
      }

      if (tagIds) {
        await setRecordTags(tx, actor.orgId, 'customer', id, tagIds);
      }

      await contactUpdated(tx, actor, 'customer', current, await findCustomer(tx, actor.orgId, id));
    });

    return toCustomerDto(await findCustomer(client, actor.orgId, id));
  } catch (error) {
    return conflictFrom(client, actor.orgId, error, {
      primaryEmail: changes.primaryEmail ?? current.primaryEmail,
      primaryPhone: changes.primaryPhone ?? current.primaryPhone,
    });
  }
};

export const removeCustomers = async (
  client: Db,
  actor: Actor,
  ids: string[],
  options: { undoingImport?: boolean } = {},
) => {
  // Undoing an import removes only what it created (its own permission is checked there).
  if (!options.undoingImport) requirePermission(actor, 'contacts.delete');

  const removed = await client.transaction(async (tx) => {
    // A runaway deletion is stopped (not an import being undone); what is deleted goes to the recycle bin first.
    if (!options.undoingImport)
      await guardDeletions(tx, userCaller(actor), ids.length, 'customers', actor.role);
    await moveToTrash(tx, userCaller(actor), 'customer', ids);

    const rows = await tx
      .delete(customers)
      .where(and(eq(customers.orgId, actor.orgId), inArray(customers.id, ids)))
      .returning();

    await contactsRemoved(tx, actor, 'customer', rows);

    return rows;
  });

  return { removed: removed.length };
};

const tagsByCustomer = async (client: Db, orgId: string, ids: string[]) => {
  const rows = await client
    .select({ id: customers.id, tagIds: tagIdsColumn('customer', customers.id) })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), inArray(customers.id, ids)));

  return new Map(rows.map((row) => [row.id, row.tagIds]));
};

/** Adds and removes tags on many customers at once. */
export const tagCustomers = async (
  client: Db,
  actor: Actor,
  input: { ids: string[]; add: string[]; remove: string[] },
) => {
  const add = await checkTagIds(client, actor.orgId, 'customer', input.add);

  const updated = await client.transaction(async (tx) => {
    const before = await tagsByCustomer(tx, actor.orgId, input.ids);

    const count = await changeTags(tx, actor.orgId, 'customer', input.ids, {
      add,
      remove: unique(input.remove),
    });

    await contactsTagged(
      tx,
      actor,
      'customer',
      before,
      await tagsByCustomer(tx, actor.orgId, input.ids),
    );

    return count;
  });

  return { updated };
};

interface LinkInput {
  role?: string | null;
  isPrimaryContact?: boolean;
  ended?: boolean;
}

/**
 * Links a person and a company, or changes their link: role, main contact
 * (one per company: taking it moves it), left / back. Same from either side.
 */
export const linkCustomerCompany = async (
  client: Db,
  actor: Actor,
  id: string,
  companyId: string,
  input: LinkInput = {},
) => {
  await findCustomer(client, actor.orgId, id);
  await assertCompany(client, actor.orgId, companyId);

  const attributes = {
    ...(input.role !== undefined ? { role: input.role?.trim() || null } : {}),
    ...(input.isPrimaryContact !== undefined ? { isPrimaryContact: input.isPrimaryContact } : {}),
    ...(input.ended !== undefined ? { endedAt: input.ended ? new Date() : null } : {}),
  };

  await client.transaction(async (tx) => {
    // One main contact per company.
    if (input.isPrimaryContact) {
      await tx
        .update(customerCompanies)
        .set({ isPrimaryContact: false, updatedAt: sql`now()` })
        .where(
          and(
            eq(customerCompanies.orgId, actor.orgId),
            eq(customerCompanies.companyId, companyId),
            eq(customerCompanies.isPrimaryContact, true),
            sql`${customerCompanies.customerId} <> ${id}`,
          ),
        );
    }

    const [row] = await tx
      .insert(customerCompanies)
      .values({ orgId: actor.orgId, customerId: id, companyId, ...attributes })
      .onConflictDoUpdate({
        target: [customerCompanies.customerId, customerCompanies.companyId],
        set: { ...attributes, updatedAt: sql`now()` },
      })
      .returning({ created: sql<boolean>`xmax = 0` });

    if (row?.created) {
      await contactsLinked(tx, actor, id, companyId, true);
    }
  });

  return { ok: true as const };
};

export const unlinkCustomerCompany = async (
  client: Db,
  actor: Actor,
  id: string,
  companyId: string,
) => {
  await findCustomer(client, actor.orgId, id);
  await client.transaction(async (tx) => {
    const unlinked = await tx
      .delete(customerCompanies)
      .where(
        and(
          eq(customerCompanies.orgId, actor.orgId),
          eq(customerCompanies.customerId, id),
          eq(customerCompanies.companyId, companyId),
        ),
      )
      .returning({ customerId: customerCompanies.customerId });

    if (unlinked.length) {
      await contactsLinked(tx, actor, id, companyId, false);
    }
  });

  return { ok: true as const };
};
