import type { CustomerExists } from '@erxes/core-contract';
import type { CustomValue, Db } from '@erxes/core-db';
import { customers } from '@erxes/core-db';
import { arrayContains, eq, getTableColumns, or, sql } from 'drizzle-orm';
import { HttpError, notFound, pgCode, pgConstraint } from '~/http/errors';
import { customFieldsColumn } from '~/modules/fields/fieldValues';
import { tagIdsColumn } from '~/modules/tags/tagLinks';

export type CustomerRow = Omit<typeof customers.$inferSelect, 'searchText'> & {
  tagIds: string[];
  customFields: Record<string, CustomValue>;
};

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
  sex: row.sex,
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

export const inOrg = (id: string) => eq(customers.id, id);

/** Customers with their tag ids and custom field values. */
export const selectCustomers = (client: Db) => {
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
export const findCustomer = async (client: Db, id: string, followMerges = false) => {
  const [row] = await selectCustomers(client)
    .where(
      followMerges ? or(eq(customers.id, id), arrayContains(customers.mergedIds, [id])) : inOrg(id),
    )
    .orderBy(sql`${customers.id} = ${id} DESC`)
    .limit(1);

  if (!row) {
    throw notFound('Customer');
  }

  return row;
};

/** A taken primary email or phone → 409 naming the customer that has it. */
export const conflictFrom = async (
  client: Db,
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
      byEmail
        ? sql`lower(${customers.primaryEmail}) = ${values.primaryEmail}`
        : eq(customers.primaryPhone, values.primaryPhone ?? ''),
    )
    .limit(1);

  throw new HttpError(
    409,
    'CUSTOMER_EXISTS',
    byEmail
      ? 'A customer with this email already exists'
      : 'A customer with this phone already exists',
    {
      field: byEmail ? 'primaryEmail' : 'primaryPhone',
      id: existing?.id ?? null,
    } satisfies CustomerExists,
  );
};
