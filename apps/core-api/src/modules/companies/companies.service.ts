import type { Db } from '@erxes/core-db';
import type { CompanyInput } from '@erxes/core-contract';
import { companies, newId } from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { type Actor, requirePermission, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import {
  normalizeEmail,
  normalizeName,
  normalizePhone,
  resolveContacts,
  unique,
} from '~/lib/contacts';
import { assertOwner } from '~/lib/guards';
import { oneRow } from '~/lib/rows';
import {
  contactCreated,
  contactsRemoved,
  contactsTagged,
  contactUpdated,
} from '~/modules/activities/contactHistory';
import { applyCustomFields } from '~/modules/fields/customValues';
import { saveCustomFields } from '~/modules/fields/fieldValues';
import { changeTags, setRecordTags, tagIdsColumn } from '~/modules/tags/tagLinks';
import { checkTagIds } from '~/modules/tags/tags.service';
import { lockRows } from '~/lib/locks';
import { guardDeletions } from '~/lib/deletionGuard';
import { moveToTrash } from '~/modules/trash/trash.service';
import { planLeadOnCreate, planLeadOnUpdate, recordLeadSteps } from '~/modules/leads/lifecycle';
import { type CompanyRow, conflictFrom, findCompany, inOrg, toCompanyDto } from './companyRows';

export const getCompany = async (client: Db, orgId: string, id: string) =>
  toCompanyDto(await findCompany(client, orgId, id, true));

const scalarFields = (input: CompanyInput) => {
  const {
    primaryName,
    names,
    primaryEmail,
    emails,
    primaryPhone,
    phones,
    tagIds,
    customFields,
    leadStageId,
    disqualifyReason,
    source,
    sourceDetails,
    ...rest
  } = input;

  return rest;
};

const nameRequired = () => new HttpError(400, 'INVALID_INPUT', 'A company needs a name');

export const createCompany = async (
  client: Db,
  actor: Actor,
  input: CompanyInput & { primaryName: string },
) => {
  await assertOwner(client, actor.orgId, input.ownerId);

  const none = { primary: null, list: [] };
  const name = resolveContacts(input.primaryName, input.names, none, normalizeName);
  const email = resolveContacts(input.primaryEmail, input.emails, none, normalizeEmail);
  const phone = resolveContacts(input.primaryPhone, input.phones, none, normalizePhone);
  const primaryName = name.primary;

  if (!primaryName) throw nameRequired();

  const tagIds = await checkTagIds(client, actor.orgId, 'company', input.tagIds ?? []);

  const customFields = await applyCustomFields(
    client,
    actor.orgId,
    'company',
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
          .insert(companies)
          .values({
            ...scalarFields(input),
            id: newId(),
            orgId: actor.orgId,
            primaryName,
            names: name.list,
            primaryEmail: email.primary,
            emails: email.list,
            primaryPhone: phone.primary,
            phones: phone.list,
            ...lead.set,
            createdBy: actor.userId,
          })
          .returning({ id: companies.id }),
      );

      await saveCustomFields(
        tx,
        actor.orgId,
        'company',
        created,
        customFields,
        Object.keys(customFields),
      );
      await recordLeadSteps(tx, userCaller(actor), 'company', [{ id: created, steps: lead.steps }]);
      await setRecordTags(tx, actor.orgId, 'company', created, tagIds);
      await contactCreated(tx, actor, 'company', await findCompany(tx, actor.orgId, created));

      return created;
    });

    return toCompanyDto(await findCompany(client, actor.orgId, id));
  } catch (error) {
    return conflictFrom(client, actor.orgId, error, primaryName);
  }
};

/** The name, email and phone columns an update changes. */
const contactColumns = (current: CompanyRow, input: CompanyInput) => {
  const changes: Partial<typeof companies.$inferInsert> = {};

  if (input.primaryName !== undefined || input.names !== undefined) {
    const name = resolveContacts(
      input.primaryName,
      input.names,
      { primary: current.primaryName, list: current.names },
      normalizeName,
    );

    if (!name.primary) throw nameRequired();

    changes.primaryName = name.primary;
    changes.names = name.list;
  }

  if (input.primaryEmail !== undefined || input.emails !== undefined) {
    const email = resolveContacts(
      input.primaryEmail,
      input.emails,
      { primary: current.primaryEmail, list: current.emails },
      normalizeEmail,
    );

    changes.primaryEmail = email.primary;
    changes.emails = email.list;
  }

  if (input.primaryPhone !== undefined || input.phones !== undefined) {
    const phone = resolveContacts(
      input.primaryPhone,
      input.phones,
      { primary: current.primaryPhone, list: current.phones },
      normalizePhone,
    );

    changes.primaryPhone = phone.primary;
    changes.phones = phone.list;
  }

  return changes;
};

export const updateCompany = async (client: Db, actor: Actor, id: string, input: CompanyInput) => {
  await lockRows(client, 'core_companies', actor.orgId, [id]);

  const current = await findCompany(client, actor.orgId, id);

  await assertOwner(client, actor.orgId, input.ownerId);

  const tagIds =
    input.tagIds === undefined
      ? undefined
      : await checkTagIds(client, actor.orgId, 'company', input.tagIds);

  const changes = contactColumns(current, input);

  const customFields =
    input.customFields === undefined
      ? undefined
      : await applyCustomFields(
          client,
          actor.orgId,
          'company',
          current.customFields,
          input.customFields,
        );

  const lead = await planLeadOnUpdate(client, userCaller(actor), current, input);

  try {
    await client.transaction(async (tx) => {
      const updated = await tx
        .update(companies)
        .set({ ...scalarFields(input), ...changes, ...lead.set, updatedAt: sql`now()` })
        .where(inOrg(actor.orgId, id))
        .returning({ id: companies.id });

      if (!updated.length) {
        throw notFound('Company');
      }

      await recordLeadSteps(tx, userCaller(actor), 'company', [{ id, steps: lead.steps }]);

      if (customFields) {
        const keys = Object.keys(input.customFields ?? {});

        await saveCustomFields(tx, actor.orgId, 'company', id, customFields, keys);
      }

      if (tagIds) {
        await setRecordTags(tx, actor.orgId, 'company', id, tagIds);
      }

      await contactUpdated(tx, actor, 'company', current, await findCompany(tx, actor.orgId, id));
    });

    return toCompanyDto(await findCompany(client, actor.orgId, id));
  } catch (error) {
    return conflictFrom(client, actor.orgId, error, changes.primaryName ?? current.primaryName);
  }
};

export const removeCompanies = async (
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
      await guardDeletions(tx, userCaller(actor), ids.length, 'companies', actor.role);
    await moveToTrash(tx, userCaller(actor), 'company', ids);

    const rows = await tx
      .delete(companies)
      .where(and(eq(companies.orgId, actor.orgId), inArray(companies.id, ids)))
      .returning();

    await contactsRemoved(tx, actor, 'company', rows);

    return rows;
  });

  return { removed: removed.length };
};

const tagsByCompany = async (client: Db, orgId: string, ids: string[]) => {
  const rows = await client
    .select({ id: companies.id, tagIds: tagIdsColumn('company', companies.id) })
    .from(companies)
    .where(and(eq(companies.orgId, orgId), inArray(companies.id, ids)));

  return new Map(rows.map((row) => [row.id, row.tagIds]));
};

export const tagCompanies = async (
  client: Db,
  actor: Actor,
  input: { ids: string[]; add: string[]; remove: string[] },
) => {
  const add = await checkTagIds(client, actor.orgId, 'company', input.add);

  const updated = await client.transaction(async (tx) => {
    const before = await tagsByCompany(tx, actor.orgId, input.ids);

    const count = await changeTags(tx, actor.orgId, 'company', input.ids, {
      add,
      remove: unique(input.remove),
    });

    await contactsTagged(
      tx,
      actor,
      'company',
      before,
      await tagsByCompany(tx, actor.orgId, input.ids),
    );

    return count;
  });

  return { updated };
};
