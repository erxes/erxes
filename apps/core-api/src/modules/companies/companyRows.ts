import type { CustomValue, Db } from '@erxes/core-db';
import { companies } from '@erxes/core-db';
import { and, arrayContains, eq, getTableColumns, or, sql } from 'drizzle-orm';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { customFieldsColumn } from '~/modules/fields/fieldValues';
import { tagIdsColumn } from '~/modules/tags/tagLinks';

export type CompanyRow = Omit<typeof companies.$inferSelect, 'searchText'> & {
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

export const inOrg = (orgId: string, id: string) =>
  and(eq(companies.orgId, orgId), eq(companies.id, id));

/** Companies with their tag ids and custom field values. */
export const selectCompanies = (client: Db) => {
  const { searchText: _searchText, ...columns } = getTableColumns(companies);

  return client
    .select({
      ...columns,
      tagIds: tagIdsColumn('company', companies.id),
      customFields: customFieldsColumn('company', companies.id),
    })
    .from(companies);
};

/** A company by id; with `followMerges`, an id merged into another company resolves to it. */
export const findCompany = async (
  client: Db,
  orgId: string,
  id: string,
  followMerges = false,
) => {
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

/** A taken name → 409 naming the company that has it. */
export const conflictFrom = async (
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
