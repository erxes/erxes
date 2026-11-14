import type { Db } from '@erxes/core-db';
import type { CompanyInput } from '@erxes/core-contract';
import { callerUserId, companies, newId, savepoint } from '@erxes/core-db';
import { inArray, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
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
import { type CompanyRow, findCompany, inOrg } from './companyRows';

export const getCompany = (client: Db, id: string) => findCompany(client, id, true);

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

const nameRequired = () =>
  fail('INVALID_INPUT', 'A company needs a name', {
    issues: [{ path: ['primaryName'], message: 'A company needs a name' }],
  });

export const createCompany = async (client: Db, input: CompanyInput & { primaryName: string }) => {
  await assertOwner(client, input.ownerId);

  const none = { primary: null, list: [] };
  const name = resolveContacts(input.primaryName, input.names, none, normalizeName);
  const email = resolveContacts(input.primaryEmail, input.emails, none, normalizeEmail);
  const phone = resolveContacts(input.primaryPhone, input.phones, none, normalizePhone);
  const primaryName = name.primary;

  if (!primaryName) throw nameRequired();

  const tagIds = await checkTagIds(client, 'company', input.tagIds ?? []);

  const customFields = await applyCustomFields(client, 'company', {}, input.customFields);

  const lead = await planLeadOnCreate(client, {
    ...input,
    state: input.state ?? 'customer',
  });

  const id = await savepoint(async (tx) => {
    const { id: created } = oneRow(
      await tx
        .insert(companies)
        .values({
          ...scalarFields(input),
          id: newId(),
          primaryName,
          names: name.list,
          primaryEmail: email.primary,
          emails: email.list,
          primaryPhone: phone.primary,
          phones: phone.list,
          ...lead.set,
          createdBy: callerUserId(),
        })
        .returning({ id: companies.id }),
    );

    await saveCustomFields(tx, 'company', created, customFields, Object.keys(customFields));
    await recordLeadSteps(tx, 'company', [{ id: created, steps: lead.steps }]);
    await setRecordTags(tx, 'company', created, tagIds);
    await contactCreated(tx, 'company', await findCompany(tx, created));

    return created;
  });

  return findCompany(client, id);
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

export const updateCompany = async (client: Db, id: string, input: CompanyInput) => {
  await lockRows(client, 'core_companies', [id]);

  const current = await findCompany(client, id);

  await assertOwner(client, input.ownerId);

  const tagIds =
    input.tagIds === undefined ? undefined : await checkTagIds(client, 'company', input.tagIds);

  const changes = contactColumns(current, input);

  const customFields =
    input.customFields === undefined
      ? undefined
      : await applyCustomFields(client, 'company', current.customFields, input.customFields);

  const lead = await planLeadOnUpdate(client, current, input);

  await savepoint(async (tx) => {
    const updated = await tx
      .update(companies)
      .set({ ...scalarFields(input), ...changes, ...lead.set, updatedAt: sql`now()` })
      .where(inOrg(id))
      .returning({ id: companies.id });

    if (!updated.length) {
      throw notFound('Company');
    }

    await recordLeadSteps(tx, 'company', [{ id, steps: lead.steps }]);

    if (customFields) {
      const keys = Object.keys(input.customFields ?? {});

      await saveCustomFields(tx, 'company', id, customFields, keys);
    }

    if (tagIds) {
      await setRecordTags(tx, 'company', id, tagIds);
    }

    await contactUpdated(tx, 'company', current, await findCompany(tx, id));
  });

  return findCompany(client, id);
};

export const removeCompanies = async (
  client: Db,
  ids: string[],
  options: { undoingImport?: boolean } = {},
) => {
  // A runaway deletion is stopped (not an import being undone); what is deleted goes to the recycle bin first.
  if (!options.undoingImport) await guardDeletions(client, ids.length, 'companies');
  await moveToTrash(client, 'company', ids);

  const rows = await client.delete(companies).where(inArray(companies.id, ids)).returning();

  await contactsRemoved(client, 'company', rows);

  return { removed: rows.length };
};

const tagsByCompany = async (client: Db, ids: string[]) => {
  const rows = await client
    .select({ id: companies.id, tagIds: tagIdsColumn('company', companies.id) })
    .from(companies)
    .where(inArray(companies.id, ids));

  return new Map(rows.map((row) => [row.id, row.tagIds]));
};

export const tagCompanies = async (
  client: Db,
  input: { ids: string[]; add: string[]; remove: string[] },
) => {
  const add = await checkTagIds(client, 'company', input.add);

  const before = await tagsByCompany(client, input.ids);

  const count = await changeTags(client, 'company', input.ids, {
    add,
    remove: unique(input.remove),
  });

  await contactsTagged(client, 'company', before, await tagsByCompany(client, input.ids));

  return { updated: count };
};
