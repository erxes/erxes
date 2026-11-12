import type { CursorQuery, CustomerInput, CustomerSex } from '@erxes/core-contract';
import type { CustomValue, Db } from '@erxes/core-db';
import {
  companies,
  customerCompanies,
  customers,
  newId,
  users,
  withTransaction,
} from '@erxes/core-db';
import type { SQL } from 'drizzle-orm';
import { and, arrayContains, asc, eq, getTableColumns, inArray, or, sql } from 'drizzle-orm';
import { type Actor, requirePermission, type Caller, userCaller } from '~/http/auth';
import { HttpError, notFound, pgCode, pgConstraint } from '~/http/errors';
import { normalizeEmail, normalizePhone, resolveContacts, unique } from '~/lib/contacts';
import { keysetPage } from '~/lib/keyset';
import { boundedList, LIST_COUNT_CAP } from '~/lib/boundedList';
import { matchEveryWord } from '~/lib/search';
import { combineContacts, combineCustomFields, fillEmpty } from '~/lib/merge';
import {
  contactCreated,
  contactsLinked,
  contactsMerged,
  contactsRemoved,
  contactsTagged,
  contactUpdated,
} from '~/modules/activities/contactHistory';
import { applyCustomFields } from '~/modules/fields/fields.service';
import { customFieldsColumn, saveCustomFields } from '~/modules/fields/fieldValues';
import {
  changeTags,
  copyTags,
  hasAnyTag,
  setRecordTags,
  tagIdsColumn,
} from '~/modules/tags/tagLinks';
import { checkTagIds } from '~/modules/tags/tags.service';
import { lockKey, lockRows } from '~/lib/locks';
import { guardDeletions } from '~/lib/deletionGuard';
import { moveToTrash } from '~/modules/trash/trash.service';
import { compileRecordFilter } from '~/modules/views/recordFilter';
import { planLeadOnCreate, planLeadOnUpdate, recordLeadSteps } from '~/modules/leads/lifecycle';

type CustomerRow = Omit<typeof customers.$inferSelect, 'searchText'> & {
  tagIds: string[];
  customFields: Record<string, CustomValue>;
};

type State = CustomerRow['state'];

export const toCustomerDto = (row: CustomerRow) => ({
  id: row.id,
  state: row.state,
  firstName: row.firstName,
  middleName: row.middleName,
  lastName: row.lastName,
  avatarUrl: row.avatarUrl,
  primaryEmail: row.primaryEmail,
  emails: row.emails,
  primaryPhone: row.primaryPhone,
  phones: row.phones,
  sex: row.sex as CustomerSex | null,
  birthDate: row.birthDate,
  position: row.position,
  department: row.department,
  code: row.code,
  description: row.description,
  ownerId: row.ownerId,
  tagIds: row.tagIds,
  customFields: row.customFields,
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

const inOrg = (orgId: string, id: string) => and(eq(customers.orgId, orgId), eq(customers.id, id));

/** Customers with their tag ids and custom field values. */
const selectCustomers = (client: Db) => {
  const { searchText: _searchText, ...columns } = getTableColumns(customers);

  return client
    .select({
      ...columns,
      tagIds: tagIdsColumn('customer', customers.id),
      customFields: customFieldsColumn('customer', customers.id),
    })
    .from(customers);
};

/** A customer by id; with `followMerges`, an id merged into another customer resolves to it. */
const findCustomer = async (client: Db, orgId: string, id: string, followMerges = false) => {
  const [row] = await selectCustomers(client)
    .where(
      followMerges
        ? and(
            eq(customers.orgId, orgId),
            or(eq(customers.id, id), arrayContains(customers.mergedIds, [id])),
          )
        : inOrg(orgId, id),
    )
    .orderBy(sql`${customers.id} = ${id} DESC`)
    .limit(1);

  if (!row) {
    throw notFound('Customer');
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

/** A taken primary email or phone → 409 naming the customer that has it. */
const conflictFrom = async (
  client: Db,
  orgId: string,
  error: unknown,
  values: { primaryEmail: string | null; primaryPhone: string | null },
): Promise<never> => {
  if (pgCode(error) !== '23505') {
    throw error;
  }

  const byEmail = pgConstraint(error) === 'core_customers_org_primary_email_key';

  const [existing] = await client
    .select({ id: customers.id })
    .from(customers)
    .where(
      and(
        eq(customers.orgId, orgId),
        byEmail
          ? sql`lower(${customers.primaryEmail}) = ${values.primaryEmail}`
          : eq(customers.primaryPhone, values.primaryPhone ?? ''),
      ),
    )
    .limit(1);

  throw new HttpError(
    409,
    'CUSTOMER_EXISTS',
    byEmail
      ? 'A customer with this email already exists'
      : 'A customer with this phone already exists',
    { field: byEmail ? 'primaryEmail' : 'primaryPhone', id: existing?.id ?? null },
  );
};

/** The list's conditions (filters, advanced filter, search): the list and exports use the same. */
export const customerListWhere = async (
  client: Db,
  actor: Actor,
  query: {
    search?: string;
    state?: State;
    ownerId?: string;
    tagIds?: string[];
    companyId?: string;
    leadStageId?: string;
    ids?: string[];
    filter?: string;
  },
) => {
  const filters: (SQL | undefined)[] = [];

  // Advanced filter (views): leads list is customers with the lead state.
  filters.push(
    await compileRecordFilter(
      client,
      actor,
      query.state === 'lead' ? 'lead' : 'customer',
      query.filter,
    ),
  );

  if (query.state) {
    filters.push(eq(customers.state, query.state));
  }

  if (query.ownerId) {
    filters.push(eq(customers.ownerId, query.ownerId));
  }

  if (query.leadStageId) {
    filters.push(eq(customers.leadStageId, query.leadStageId));
  }

  if (query.tagIds?.length) {
    filters.push(hasAnyTag('customer', customers.id, query.tagIds));
  }

  if (query.companyId) {
    filters.push(
      inArray(
        customers.id,
        client
          .select({ id: customerCompanies.customerId })
          .from(customerCompanies)
          .where(
            and(
              eq(customerCompanies.orgId, actor.orgId),
              eq(customerCompanies.companyId, query.companyId),
            ),
          ),
      ),
    );
  }

  if (query.ids) {
    filters.push(inArray(customers.id, query.ids.length ? query.ids : ['']));
  }

  if (query.search) {
    filters.push(
      // Names, emails, phones and code, in one trigram-indexed column.
      matchEveryWord(query.search, (pattern, phonePattern) =>
        pattern === phonePattern
          ? sql`${customers.searchText} LIKE ${pattern.toLowerCase()}`
          : sql`(${customers.searchText} LIKE ${pattern.toLowerCase()} OR ${customers.searchText} LIKE ${phonePattern.toLowerCase()})`,
      ),
    );
  }

  return and(...filters);
};

export const listCustomers = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & Parameters<typeof customerListWhere>[2],
) => {
  const page = await boundedList(Boolean(query.filter || query.search), async () =>
    keysetPage(
      client,
      {
        table: customers,
        id: customers.id,
        createdAt: customers.createdAt,
        scope: eq(customers.orgId, actor.orgId),
        countCap: LIST_COUNT_CAP,
      },
      await customerListWhere(client, actor, query),
      query,
      (where, orderBy, limit) =>
        selectCustomers(client)
          .where(where)
          .orderBy(...orderBy)
          .limit(limit),
    ),
  );

  return { ...page, data: page.data.map(toCustomerDto) };
};

export const getCustomer = async (client: Db, orgId: string, id: string) =>
  toCustomerDto(await findCustomer(client, orgId, id, true));

/** The plain columns of an input (contacts, tags and custom fields are resolved separately). */
const scalarFields = (input: CustomerInput) => {
  const {
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
      const [row] = await tx
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
        .returning({ id: customers.id });

      await saveCustomFields(
        tx,
        actor.orgId,
        'customer',
        row!.id,
        customFields,
        Object.keys(customFields),
      );
      await recordLeadSteps(tx, userCaller(actor), 'customer', row!.id, lead.steps);
      await setRecordTags(tx, actor.orgId, 'customer', row!.id, tagIds);
      await contactCreated(tx, actor, 'customer', await findCustomer(tx, actor.orgId, row!.id));

      return row!.id;
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

  const changes: Partial<typeof customers.$inferInsert> = {};

  const tagIds =
    input.tagIds === undefined
      ? undefined
      : await checkTagIds(client, actor.orgId, 'customer', input.tagIds);

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
        await saveCustomFields(
          tx,
          actor.orgId,
          'customer',
          id,
          customFields,
          Object.keys(input.customFields ?? {}),
        );
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

const tagsByCustomer = async (client: Db, orgId: string, ids: string[]) => {
  const rows = await client
    .select({ id: customers.id, tagIds: tagIdsColumn('customer', customers.id) })
    .from(customers)
    .where(and(eq(customers.orgId, orgId), inArray(customers.id, ids)));

  return new Map(rows.map((row) => [row.id, row.tagIds]));
};

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

    if (rows.length !== ids.length) {
      throw notFound('Customer');
    }

    const keep = rows.find((row) => row.id === input.keepId)!;

    const others = ids
      .filter((id) => id !== keep.id)
      .map((id) => rows.find((row) => row.id === id)!);

    const otherIds = others.map((other) => other.id);

    const email = combineContacts(
      { primary: keep.primaryEmail, list: keep.emails },
      others.map((other) => ({ primary: other.primaryEmail, list: other.emails })),
    );

    const phone = combineContacts(
      { primary: keep.primaryPhone, list: keep.phones },
      others.map((other) => ({ primary: other.primaryPhone, list: other.phones })),
    );

    // Company links move to the kept customer before the others go.
    await tx.execute(sql`
      INSERT INTO ${customerCompanies} (org_id, customer_id, company_id)
      SELECT ${actor.orgId}, ${keep.id}, company_id FROM ${customerCompanies}
      WHERE customer_id IN (${sql.join(
        otherIds.map((id) => sql`${id}`),
        sql`, `,
      )})
      ON CONFLICT DO NOTHING
    `);
    await copyTags(tx, actor.orgId, 'customer', otherIds, keep.id);
    // Deleting first frees their primary email and phone for the kept customer.
    await tx
      .delete(customers)
      .where(and(eq(customers.orgId, actor.orgId), inArray(customers.id, otherIds)));

    await tx
      .update(customers)
      .set({
        ...fillEmpty(keep, others, MERGE_FILLED),
        state: rows.some((row) => row.state === 'customer') ? 'customer' : 'lead',
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

    await saveCustomFields(tx, actor.orgId, 'customer', keep.id, combined, Object.keys(combined));

    const merged = await findCustomer(tx, actor.orgId, keep.id);

    await contactsMerged(tx, actor, 'customer', merged, others);

    return toCustomerDto(merged);
  });
};

const findCompanyId = async (client: Db, orgId: string, companyId: string) => {
  const [company] = await client
    .select({ id: companies.id })
    .from(companies)
    .where(and(eq(companies.orgId, orgId), eq(companies.id, companyId)))
    .limit(1);

  if (!company) {
    throw notFound('Company');
  }
};

/** A link as the API shows it. */
export const linkDto = (row: {
  role: string | null;
  isPrimaryContact: boolean;
  endedAt: Date | null;
  createdAt: Date;
}) => ({
  role: row.role,
  isPrimaryContact: row.isPrimaryContact,
  endedAt: row.endedAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
});

const linkColumns = {
  role: customerCompanies.role,
  isPrimaryContact: customerCompanies.isPrimaryContact,
  endedAt: customerCompanies.endedAt,
  createdAt: customerCompanies.createdAt,
};

/** Current links first (main contact first), then former ones; oldest first within each. */
export const linkOrder = [
  sql`${customerCompanies.endedAt} IS NOT NULL`,
  sql`${customerCompanies.isPrimaryContact} DESC`,
  asc(customerCompanies.createdAt),
];

export const customerCompaniesOf = async (client: Db, actor: Actor, id: string) => {
  await findCustomer(client, actor.orgId, id);

  const rows = await client
    .select({
      id: companies.id,
      primaryName: companies.primaryName,
      avatarUrl: companies.avatarUrl,
      website: companies.website,
      ...linkColumns,
    })
    .from(customerCompanies)
    .innerJoin(companies, eq(companies.id, customerCompanies.companyId))
    .where(and(eq(customerCompanies.orgId, actor.orgId), eq(customerCompanies.customerId, id)))
    .orderBy(...linkOrder);

  return {
    data: rows.map(({ role, isPrimaryContact, endedAt, createdAt, ...company }) => ({
      ...company,
      link: linkDto({ role, isPrimaryContact, endedAt, createdAt }),
    })),
  };
};

export interface LinkInput {
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
  await findCompanyId(client, actor.orgId, companyId);

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

/**
 * The customer with this email or phone (also among their other emails and
 * phones), or a new one. Calls for the same email or phone run one at a time,
 * so two at once never make two customers.
 */
export const findOrCreateCustomer = async (
  client: Db,
  caller: Caller,
  input: {
    primaryEmail?: string;
    primaryPhone?: string;
    firstName?: string;
    lastName?: string;
    state?: 'lead' | 'customer';
    source?: string | null;
    sourceDetails?: Record<string, string>;
  },
) => {
  const email = input.primaryEmail ? normalizeEmail(input.primaryEmail) : null;
  const phone = input.primaryPhone ? normalizePhone(input.primaryPhone) : null;

  for (const key of [email && `email:${email}`, phone && `phone:${phone}`].filter(
    Boolean,
  ) as string[]) {
    await lockKey(client, `customer:${caller.orgId}:${key}`);
  }

  const [found] = await client
    .select({ id: customers.id })
    .from(customers)
    .where(
      and(
        eq(customers.orgId, caller.orgId),
        or(
          email
            ? or(eq(customers.primaryEmail, email), arrayContains(customers.emails, [email]))
            : undefined,
          phone
            ? or(eq(customers.primaryPhone, phone), arrayContains(customers.phones, [phone]))
            : undefined,
        ),
      ),
    )
    .orderBy(sql`${customers.primaryEmail} = ${email ?? ''} DESC`)
    .limit(1);

  if (found)
    return {
      customer: toCustomerDto(await findCustomer(client, caller.orgId, found.id)),
      created: false,
    };

  const lead = await planLeadOnCreate(client, caller, {
    state: input.state ?? 'customer',
    source: input.source,
    sourceDetails: input.sourceDetails,
  });

  const id = await client.transaction(async (tx) => {
    const [row] = await tx
      .insert(customers)
      .values({
        ...lead.set,
        id: newId(),
        orgId: caller.orgId,
        state: input.state ?? 'customer',
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        primaryEmail: email,
        emails: email ? [email] : [],
        primaryPhone: phone,
        phones: phone ? [phone] : [],
        createdBy: caller.actorType === 'user' ? caller.actorId : null,
      })
      .returning({ id: customers.id });

    await recordLeadSteps(tx, caller, 'customer', row!.id, lead.steps);
    await contactCreated(tx, caller, 'customer', await findCustomer(tx, caller.orgId, row!.id));

    return row!.id;
  });

  return { customer: toCustomerDto(await findCustomer(client, caller.orgId, id)), created: true };
};
