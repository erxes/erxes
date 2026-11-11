import type { CursorQuery, CustomerInput, CustomerSex } from '@erxes/core-contract';
import { companies, customerCompanies, customers, Db, newId, users, withTransaction } from '@erxes/core-db';
import { and, arrayContains, asc, eq, getTableColumns, ilike, inArray, or, SQL, sql } from 'drizzle-orm';
import { type Actor, requireManager } from '~/http/auth';
import { HttpError, notFound, pgCode, pgConstraint } from '~/http/errors';
import { normalizeEmail, normalizePhone, resolveContacts, unique } from '~/lib/contacts';
import { containsPattern, keysetPage } from '~/lib/keyset';
import { combineContacts, combineCustomFields, fillEmpty } from '~/lib/merge';
import { applyCustomFields } from '~/modules/fields/fields.service';
import { changeTags, copyTags, hasAnyTag, setRecordTags, tagIdsColumn } from '~/modules/tags/tagLinks';
import { checkTagIds } from '~/modules/tags/tags.service';

type CustomerRow = typeof customers.$inferSelect & { tagIds: string[] };
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
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const inOrg = (orgId: string, id: string) => and(eq(customers.orgId, orgId), eq(customers.id, id));

/** Customers with their tag ids. */
const selectCustomers = (client: Db) =>
  client.select({ ...getTableColumns(customers), tagIds: tagIdsColumn('customer', customers.id) }).from(customers);

/** A customer by id; with `followMerges`, an id merged into another customer resolves to it. */
const findCustomer = async (client: Db, orgId: string, id: string, followMerges = false) => {
  const [row] = await selectCustomers(client)
    .where(
      followMerges
        ? and(eq(customers.orgId, orgId), or(eq(customers.id, id), arrayContains(customers.mergedIds, [id])))
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
    throw new HttpError(400, 'INVALID_OWNER', 'The owner is not a team member of this organisation');
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
    byEmail ? 'A customer with this email already exists' : 'A customer with this phone already exists',
    { field: byEmail ? 'primaryEmail' : 'primaryPhone', id: existing?.id ?? null },
  );
};

export const listCustomers = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & {
    search?: string;
    state?: State;
    ownerId?: string;
    tagIds?: string[];
    companyId?: string;
    ids?: string[];
  },
) => {
  const filters: (SQL | undefined)[] = [];

  if (query.state) {
    filters.push(eq(customers.state, query.state));
  }

  if (query.ownerId) {
    filters.push(eq(customers.ownerId, query.ownerId));
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
            and(eq(customerCompanies.orgId, actor.orgId), eq(customerCompanies.companyId, query.companyId)),
          ),
      ),
    );
  }

  if (query.ids) {
    filters.push(inArray(customers.id, query.ids.length ? query.ids : ['']));
  }

  if (query.search) {
    const pattern = containsPattern(query.search);
    filters.push(
      or(
        sql`concat_ws(' ', ${customers.firstName}, ${customers.middleName}, ${customers.lastName}) ILIKE ${pattern}`,
        ilike(customers.primaryEmail, pattern),
        ilike(customers.primaryPhone, containsPattern(normalizePhone(query.search))),
        ilike(customers.code, pattern),
      ),
    );
  }

  const page = await keysetPage(
    client,
    {
      table: customers,
      id: customers.id,
      createdAt: customers.createdAt,
      scope: eq(customers.orgId, actor.orgId),
    },
    and(...filters),
    query,
    (where, orderBy, limit) => selectCustomers(client).where(where).orderBy(...orderBy).limit(limit),
  );

  return { ...page, data: page.data.map(toCustomerDto) };
};

export const getCustomer = async (client: Db, actor: Actor, id: string) =>
  toCustomerDto(await findCustomer(client, actor.orgId, id, true));

/** The plain columns of an input (contacts, tags and custom fields are resolved separately). */
const scalarFields = (input: CustomerInput) => {
  const { primaryEmail, emails, primaryPhone, phones, tagIds, customFields, ...rest } = input;

  return rest;
};

export const createCustomer = async (client: Db, actor: Actor, input: CustomerInput) => {
  await assertOwner(client, actor.orgId, input.ownerId);

  const none = { primary: null, list: [] };
  const email = resolveContacts(input.primaryEmail, input.emails, none, normalizeEmail);
  const phone = resolveContacts(input.primaryPhone, input.phones, none, normalizePhone);
  const tagIds = await checkTagIds(client, actor.orgId, 'customer', input.tagIds ?? []);
  const customFields = await applyCustomFields(client, actor.orgId, 'customer', {}, input.customFields);

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
          customFields,
          createdBy: actor.userId,
        })
        .returning({ id: customers.id });

      await setRecordTags(tx, actor.orgId, 'customer', row!.id, tagIds);

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

export const updateCustomer = async (client: Db, actor: Actor, id: string, input: CustomerInput) => {
  const current = await findCustomer(client, actor.orgId, id);

  await assertOwner(client, actor.orgId, input.ownerId);

  const changes: Partial<typeof customers.$inferInsert> = {};
  const tagIds = input.tagIds === undefined ? undefined : await checkTagIds(client, actor.orgId, 'customer', input.tagIds);

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

  if (input.customFields !== undefined) {
    changes.customFields = await applyCustomFields(
      client,
      actor.orgId,
      'customer',
      current.customFields,
      input.customFields,
    );
  }

  try {
    await client.transaction(async (tx) => {
      const updated = await tx
        .update(customers)
        .set({ ...scalarFields(input), ...changes, updatedAt: sql`now()` })
        .where(inOrg(actor.orgId, id))
        .returning({ id: customers.id });

      if (!updated.length) {
        throw notFound('Customer');
      }

      if (tagIds) {
        await setRecordTags(tx, actor.orgId, 'customer', id, tagIds);
      }
    });

    return toCustomerDto(await findCustomer(client, actor.orgId, id));
  } catch (error) {
    return conflictFrom(client, actor.orgId, error, {
      primaryEmail: changes.primaryEmail ?? current.primaryEmail,
      primaryPhone: changes.primaryPhone ?? current.primaryPhone,
    });
  }
};

export const removeCustomers = async (client: Db, actor: Actor, ids: string[]) => {
  requireManager(actor, 'Only owners and admins can delete customers');

  const removed = await client
    .delete(customers)
    .where(and(eq(customers.orgId, actor.orgId), inArray(customers.id, ids)))
    .returning({ id: customers.id });

  return { removed: removed.length };
};

/** Adds and removes tags on many customers at once. */
export const tagCustomers = async (
  client: Db,
  actor: Actor,
  input: { ids: string[]; add: string[]; remove: string[] },
) => {
  const add = await checkTagIds(client, actor.orgId, 'customer', input.add);
  const updated = await client.transaction((tx) =>
    changeTags(tx, actor.orgId, 'customer', input.ids, { add, remove: unique(input.remove) }),
  );

  return { updated };
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
  requireManager(actor, 'Only owners and admins can merge customers');

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
    const others = ids.filter((id) => id !== keep.id).map((id) => rows.find((row) => row.id === id)!);
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
    await tx.delete(customers).where(and(eq(customers.orgId, actor.orgId), inArray(customers.id, otherIds)));

    await tx
      .update(customers)
      .set({
        ...fillEmpty(keep, others, MERGE_FILLED),
        state: rows.some((row) => row.state === 'customer') ? 'customer' : 'lead',
        primaryEmail: email.primary,
        emails: email.list,
        primaryPhone: phone.primary,
        phones: phone.list,
        customFields: combineCustomFields(
          keep.customFields,
          others.map((other) => other.customFields),
        ),
        mergedIds: unique([
          ...keep.mergedIds,
          ...otherIds,
          ...others.flatMap((other) => other.mergedIds),
        ]),
        updatedAt: sql`now()`,
      })
      .where(inOrg(actor.orgId, keep.id));

    return toCustomerDto(await findCustomer(tx, actor.orgId, keep.id));
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

export const customerCompaniesOf = async (client: Db, actor: Actor, id: string) => {
  await findCustomer(client, actor.orgId, id);

  const rows = await client
    .select({
      id: companies.id,
      primaryName: companies.primaryName,
      avatarUrl: companies.avatarUrl,
      website: companies.website,
    })
    .from(customerCompanies)
    .innerJoin(companies, eq(companies.id, customerCompanies.companyId))
    .where(and(eq(customerCompanies.orgId, actor.orgId), eq(customerCompanies.customerId, id)))
    .orderBy(asc(customerCompanies.createdAt));

  return { data: rows };
};

export const linkCustomerCompany = async (client: Db, actor: Actor, id: string, companyId: string) => {
  await findCustomer(client, actor.orgId, id);
  await findCompanyId(client, actor.orgId, companyId);
  await client
    .insert(customerCompanies)
    .values({ orgId: actor.orgId, customerId: id, companyId })
    .onConflictDoNothing();

  return { ok: true as const };
};

export const unlinkCustomerCompany = async (client: Db, actor: Actor, id: string, companyId: string) => {
  await findCustomer(client, actor.orgId, id);
  await client
    .delete(customerCompanies)
    .where(
      and(
        eq(customerCompanies.orgId, actor.orgId),
        eq(customerCompanies.customerId, id),
        eq(customerCompanies.companyId, companyId),
      ),
    );

  return { ok: true as const };
};
