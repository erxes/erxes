import type { ViewRecordType } from '@erxes/core-contract';
import { companies, customers, type Db, products } from '@erxes/core-db';
import { invalidFilter } from '@erxes/plugin-sdk/filter';
import { sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import { hostListSource } from '~/modules/dataExtensions/hostFilters';
import type { FieldSpec } from './fieldSpec';

/**
 * Core lists' Data Extensions fields: `subject.data.<key>` in filters and saved views (and a
 * customer's company's, `subject.company.data.<key>`), and `data.<key>` as a list's sort.
 */

const SOURCES: Record<ViewRecordType, { recordType: string; id: PgColumn }> = {
  customer: { recordType: 'core.customer', id: customers.id },
  lead: { recordType: 'core.customer', id: customers.id },
  company: { recordType: 'core.company', id: companies.id },
  company_lead: { recordType: 'core.company', id: companies.id },
  product: { recordType: 'core.product', id: products.id },
};

const sourceOf = (client: Db, list: ViewRecordType) => {
  const { recordType, id } = SOURCES[list];

  return hostListSource(client, recordType, sql`${id}`);
};

/** The list's Data Extensions fields as filters: members' under Properties, a plugin's under its title. */
export const dataFilterFields = async (client: Db, list: ViewRecordType): Promise<FieldSpec[]> =>
  ((await sourceOf(client, list))?.filters ?? []).map(({ field: _field, pluginTitle, ...spec }) =>
    pluginTitle
      ? { ...spec, group: 'plugin' as const, groupLabel: pluginTitle }
      : { ...spec, group: 'custom' as const },
  );

const COMPANY_PATH = 'subject.company.';

/**
 * A customer list's filters by the linked company's Data Extensions fields
 * (`subject.company.data.<key>`): a customer matches when one of its companies does.
 */
export const companyDataFilterFields = async (client: Db): Promise<FieldSpec[]> =>
  ((await sourceOf(client, 'company'))?.filters ?? []).map(
    ({ field: _field, pluginTitle: _title, ...spec }) => ({
      ...spec,
      path: `${COMPANY_PATH}${spec.path.slice('subject.'.length)}`,
      label: `Company ${spec.label}`,
      group: 'company' as const,
      viaCompany: true,
    }),
  );

/** A list query's order by a Data Extensions field (`data.<key>`), ascending unless said. */
export interface DataSortInput {
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * A core list's order by a Data Extensions field (`data.<key>`), records without a value last;
 * none without `sortField`. 400 INVALID_FILTER for a field the list can't be sorted by.
 */
export const dataSort = async (client: Db, list: ViewRecordType, query: DataSortInput) => {
  if (!query.sortField) return undefined;

  const expr = (await sourceOf(client, list))?.sortBy(query.sortField);

  if (!expr) throw invalidFilter(`The list can't be sorted by ${query.sortField}`);

  return { expr, descending: query.sortDirection === 'desc' };
};
