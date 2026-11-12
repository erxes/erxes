import type { CustomValue, Db } from '@erxes/core-db';
import type { CompanyInput, CursorQuery } from '@erxes/core-contract';
import {
  companies,
  customerCompanies,
  newId,
  users,
  withTransaction,
  customers,
} from '@erxes/core-db';
import {
  and,
  arrayContains,
  asc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  or,
  SQL,
  sql,
} from 'drizzle-orm';
import { type Actor, requirePermission, userCaller } from '~/http/auth';
import { HttpError, notFound, pgCode } from '~/http/errors';
import {
  normalizeEmail,
  normalizeName,
  normalizePhone,
  resolveContacts,
  unique,
} from '~/lib/contacts';
import { keysetPage } from '~/lib/keyset';
import { matchEveryWord } from '~/lib/search';
import { combineContacts, combineCustomFields, fillEmpty } from '~/lib/merge';
import {
  contactCreated,
  contactsMerged,
  contactsRemoved,
  contactsTagged,
  contactUpdated,
} from '~/modules/activities/contactHistory';
import { applyCustomFields } from '~/modules/fields/fields.service';
import { customFieldsColumn, saveCustomFields } from '~/modules/fields/fieldValues';
import { boundedList, LIST_COUNT_CAP } from '~/lib/boundedList';
import {
  changeTags,
  copyTags,
  hasAnyTag,
  setRecordTags,
  tagIdsColumn,
} from '~/modules/tags/tagLinks';
import { checkTagIds } from '~/modules/tags/tags.service';
import { lockRows } from '~/lib/locks';
import { guardDeletions } from '~/lib/deletionGuard';
import { moveToTrash } from '~/modules/trash/trash.service';
import { compileRecordFilter } from '~/modules/views/recordFilter';
import { planLeadOnCreate, planLeadOnUpdate, recordLeadSteps } from '~/modules/leads/lifecycle';

type CompanyRow = Omit<typeof companies.$inferSelect, 'searchText'> & {
  tagIds: string[];
  customFields: Record<string, CustomValue>;
};

export const toCompanyDto = (row: CompanyRow) => ({
  id: row.id,
  primaryName: row.primaryName,
  names: row.names,
  avatarUrl: row.avatarUrl,
  primaryEmail: row.primaryEmail,
  emails: row.emails,
  primaryPhone: row.primaryPhone,
  phones: row.phones,
  website: row.website,
  industry: row.industry,
  size: row.size,
  businessType: row.businessType,
  code: row.code,
  description: row.description,
  ownerId: row.ownerId,
  tagIds: row.tagIds,
  customFields: row.customFields,
  state: row.state,
  leadStageId: row.leadStageId,
  leadStageChangedAt: row.leadStageChangedAt?.toISOString() ?? null,
  disqualifyReason: row.disqualifyReason,
  source: row.source,
  sourceDetails: row.sourceDetails,
  convertedAt: row.convertedAt?.toISOString() ?? null,
  lastActivityAt: row.lastActivityAt.toISOString(),
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const inOrg = (orgId: string, id: string) => and(eq(companies.orgId, orgId), eq(companies.id, id));

/** Companies with their tag ids and custom field values. */
const selectCompanies = (client: Db) => {
  const { searchText: _searchText, ...columns } = getTableColumns(companies);

  return client
    .select({
      ...columns,
      tagIds: tagIdsColumn('company', companies.id),
      customFields: customFieldsColumn('company', companies.id),
    })
    .from(companies);
};

const findCompany = async (client: Db, orgId: string, id: string, followMerges = false) => {
  const [row] = await selectCompanies(client)
    .where(
      followMerges
        ? and(
            eq(companies.orgId, orgId),
            or(eq(companies.id, id), arrayContains(companies.mergedIds, [id])),
          )
        : inOrg(orgId, id),
    )
    .orderBy(sql`${companies.id} = ${id} DESC`)
    .limit(1);

  if (!row) {
    throw notFound('Company');
  }

  return row;
};

const assertOwner = async (client: Db, orgId: string, ownerId: string | null | undefined) => {
  if (!ownerId) {
    return;
  }

  const [owner] = await client
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.orgId, orgId), eq(users.id, ownerId)))
    .limit(1);

  if (!owner) {
    throw new HttpError(
      400,
      'INVALID_OWNER',
      'The owner is not a team member of this organisation',
    );
  }
};

/** A taken name → 409 naming the company that has it. */
const conflictFrom = async (
  client: Db,
  orgId: string,
  error: unknown,
  name: string,
): Promise<never> => {
  if (pgCode(error) !== '23505') {
    throw error;
  }

  const [existing] = await client
    .select({ id: companies.id })
    .from(companies)
    .where(and(eq(companies.orgId, orgId), sql`lower(${companies.primaryName}) = lower(${name})`))
    .limit(1);

  throw new HttpError(409, 'COMPANY_EXISTS', 'A company with this name already exists', {
    field: 'primaryName',
    id: existing?.id ?? null,
  });
};

/** The list's conditions (filters, advanced filter, search): the list and exports use the same. */
export const companyListWhere = async (
  client: Db,
  actor: Actor,
  query: {
    search?: string;
    state?: 'lead' | 'customer';
    leadStageId?: string;
    ownerId?: string;
    tagIds?: string[];
    customerId?: string;
    ids?: string[];
    filter?: string;
  },
) => {
  // Company leads have their own views (and lead fields).
  const filters: (SQL | undefined)[] = [
    await compileRecordFilter(
      client,
      actor,
      query.state === 'lead' ? 'company_lead' : 'company',
      query.filter,
    ),
  ];

  if (query.state) {
    filters.push(eq(companies.state, query.state));
  }

  if (query.leadStageId) {
    filters.push(eq(companies.leadStageId, query.leadStageId));
  }

  if (query.ownerId) {
    filters.push(eq(companies.ownerId, query.ownerId));
  }

  if (query.tagIds?.length) {
    filters.push(hasAnyTag('company', companies.id, query.tagIds));
  }

  if (query.customerId) {
    filters.push(
      inArray(
        companies.id,
        client
          .select({ id: customerCompanies.companyId })
          .from(customerCompanies)
          .where(
            and(
              eq(customerCompanies.orgId, actor.orgId),
              eq(customerCompanies.customerId, query.customerId),
            ),
          ),
      ),
    );
  }

  if (query.ids) {
    filters.push(inArray(companies.id, query.ids.length ? query.ids : ['']));
  }

  if (query.search) {
    filters.push(
      matchEveryWord(query.search, (pattern, phonePattern) =>
        or(
          // Names, emails, phones and code, in one trigram-indexed column.
          sql`${companies.searchText} LIKE ${pattern.toLowerCase()}`,
          pattern === phonePattern
            ? undefined
            : sql`${companies.searchText} LIKE ${phonePattern.toLowerCase()}`,
          ilike(companies.website, pattern),
          ilike(companies.industry, pattern),
          ilike(companies.code, pattern),
        ),
      ),
    );
  }

  return and(...filters);
};

export const listCompanies = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & Parameters<typeof companyListWhere>[2],
) => {
  const page = await boundedList(Boolean(query.filter || query.search), async () =>
    keysetPage(
      client,
      {
        table: companies,
        id: companies.id,
        createdAt: companies.createdAt,
        scope: eq(companies.orgId, actor.orgId),
        countCap: LIST_COUNT_CAP,
      },
      await companyListWhere(client, actor, query),
      query,
      (where, orderBy, limit) =>
        selectCompanies(client)
          .where(where)
          .orderBy(...orderBy)
          .limit(limit),
    ),
  );

  return { ...page, data: page.data.map(toCompanyDto) };
};

export const getCompany = async (client: Db, actor: Actor, id: string) =>
  toCompanyDto(await findCompany(client, actor.orgId, id, true));

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
      const [row] = await tx
        .insert(companies)
        .values({
          ...scalarFields(input),
          id: newId(),
          orgId: actor.orgId,
          primaryName: name.primary!,
          names: name.list,
          primaryEmail: email.primary,
          emails: email.list,
          primaryPhone: phone.primary,
          phones: phone.list,
          ...lead.set,
          createdBy: actor.userId,
        })
        .returning({ id: companies.id });

      await saveCustomFields(
        tx,
        actor.orgId,
        'company',
        row!.id,
        customFields,
        Object.keys(customFields),
      );
      await recordLeadSteps(tx, userCaller(actor), 'company', row!.id, lead.steps);
      await setRecordTags(tx, actor.orgId, 'company', row!.id, tagIds);
      await contactCreated(tx, actor, 'company', await findCompany(tx, actor.orgId, row!.id));

      return row!.id;
    });

    return toCompanyDto(await findCompany(client, actor.orgId, id));
  } catch (error) {
    return conflictFrom(client, actor.orgId, error, name.primary!);
  }
};

export const updateCompany = async (client: Db, actor: Actor, id: string, input: CompanyInput) => {
  await lockRows(client, 'core_companies', actor.orgId, [id]);

  const current = await findCompany(client, actor.orgId, id);

  await assertOwner(client, actor.orgId, input.ownerId);

  const changes: Partial<typeof companies.$inferInsert> = {};

  const tagIds =
    input.tagIds === undefined
      ? undefined
      : await checkTagIds(client, actor.orgId, 'company', input.tagIds);

  if (input.primaryName !== undefined || input.names !== undefined) {
    const name = resolveContacts(
      input.primaryName,
      input.names,
      { primary: current.primaryName, list: current.names },
      normalizeName,
    );

    if (!name.primary) {
      throw new HttpError(400, 'INVALID_INPUT', 'A company needs a name');
    }

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

      await recordLeadSteps(tx, userCaller(actor), 'company', id, lead.steps);

      if (customFields) {
        await saveCustomFields(
          tx,
          actor.orgId,
          'company',
          id,
          customFields,
          Object.keys(input.customFields ?? {}),
        );
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

const tagsByCompany = async (client: Db, orgId: string, ids: string[]) => {
  const rows = await client
    .select({ id: companies.id, tagIds: tagIdsColumn('company', companies.id) })
    .from(companies)
    .where(and(eq(companies.orgId, orgId), inArray(companies.id, ids)));

  return new Map(rows.map((row) => [row.id, row.tagIds]));
};

const MERGE_FILLED = [
  'avatarUrl',
  'website',
  'industry',
  'size',
  'businessType',
  'code',
  'description',
  'ownerId',
] as const;

/** Merges companies into `keepId`, as `mergeCustomers` does; the others' names become extra names. */
export const mergeCompanies = async (actor: Actor, input: { ids: string[]; keepId: string }) => {
  requirePermission(actor, 'contacts.merge');

  const ids = unique(input.ids);

  if (ids.length < 2) {
    throw new HttpError(400, 'INVALID_INPUT', 'Choose at least two companies to merge');
  }

  return withTransaction(async (tx) => {
    const rows = await selectCompanies(tx)
      .where(and(eq(companies.orgId, actor.orgId), inArray(companies.id, ids)))
      .orderBy(asc(companies.createdAt))
      .for('update');

    if (rows.length !== ids.length) {
      throw notFound('Company');
    }

    const keep = rows.find((row) => row.id === input.keepId)!;

    const others = ids
      .filter((id) => id !== keep.id)
      .map((id) => rows.find((row) => row.id === id)!);

    const otherIds = others.map((other) => other.id);

    const contacts = (pick: (row: CompanyRow) => { primary: string | null; list: string[] }) =>
      combineContacts(pick(keep), others.map(pick));

    const name = contacts((row) => ({ primary: row.primaryName, list: row.names }));
    const email = contacts((row) => ({ primary: row.primaryEmail, list: row.emails }));
    const phone = contacts((row) => ({ primary: row.primaryPhone, list: row.phones }));

    await tx.execute(sql`
      INSERT INTO ${customerCompanies} (org_id, customer_id, company_id)
      SELECT ${actor.orgId}, customer_id, ${keep.id} FROM ${customerCompanies}
      WHERE company_id IN (${sql.join(
        otherIds.map((id) => sql`${id}`),
        sql`, `,
      )})
      ON CONFLICT DO NOTHING
    `);
    await copyTags(tx, actor.orgId, 'company', otherIds, keep.id);
    await tx
      .delete(companies)
      .where(and(eq(companies.orgId, actor.orgId), inArray(companies.id, otherIds)));

    await tx
      .update(companies)
      .set({
        ...fillEmpty(keep, others, MERGE_FILLED),
        names: name.list,
        primaryEmail: email.primary,
        emails: email.list,
        primaryPhone: phone.primary,
        phones: phone.list,
        mergedIds: unique([
          ...keep.mergedIds,
          ...otherIds,
          ...others.flatMap((other) => other.mergedIds),
        ]),
        updatedAt: sql`now()`,
      })
      .where(inOrg(actor.orgId, keep.id));

    const combined = combineCustomFields(
      keep.customFields,
      others.map((other) => other.customFields),
    );

    await saveCustomFields(tx, actor.orgId, 'company', keep.id, combined, Object.keys(combined));

    const merged = await findCompany(tx, actor.orgId, keep.id);

    await contactsMerged(tx, actor, 'company', merged, others);

    return toCompanyDto(merged);
  });
};

/** The company's people with their links: main contact first, then current, then former. */
export const companyPeople = async (client: Db, actor: Actor, id: string) => {
  const { linkDto, linkOrder } = await import('~/modules/customers/customers.service');

  await findCompany(client, actor.orgId, id);

  const rows = await client
    .select({
      id: customers.id,
      firstName: customers.firstName,
      lastName: customers.lastName,
      primaryEmail: customers.primaryEmail,
      primaryPhone: customers.primaryPhone,
      avatarUrl: customers.avatarUrl,
      state: customers.state,
      role: customerCompanies.role,
      isPrimaryContact: customerCompanies.isPrimaryContact,
      endedAt: customerCompanies.endedAt,
      createdAt: customerCompanies.createdAt,
    })
    .from(customerCompanies)
    .innerJoin(customers, eq(customers.id, customerCompanies.customerId))
    .where(and(eq(customerCompanies.orgId, actor.orgId), eq(customerCompanies.companyId, id)))
    .orderBy(...linkOrder)
    .limit(500);

  return {
    data: rows.map(({ role, isPrimaryContact, endedAt, createdAt, ...person }) => ({
      ...person,
      link: linkDto({ role, isPrimaryContact, endedAt, createdAt }),
    })),
  };
};
