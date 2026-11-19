import { PLUGIN_LIST_TYPE, type SORT_DIRECTIONS, VIEW_RECORD_TYPES } from '../enums';
import { boolean, check, foreignKey, index, jsonb, text } from 'drizzle-orm/pg-core';
import { inListOrMatch, orgIdColumn, pgTable } from '../table';
import { type ConditionGroup, createdAt, type PluginListType, updatedAt } from './common';
import { organizations } from './organizations';

/** A core list (`VIEW_RECORD_TYPES`) or a plugin's, `<plugin>:<record>`. */
export type ViewListType = (typeof VIEW_RECORD_TYPES)[number] | PluginListType;

export interface ViewSort {
  field: string;
  direction: (typeof SORT_DIRECTIONS)[number];
}

/**
 * A saved list: a name, a filter (the same condition language automations
 * use), the search, columns and sort. Private to its creator or shared with
 * the team; always run live, so it never goes stale.
 */
export const views = pgTable(
  'views',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** One of core's lists, or a plugin's (`PLUGIN_LIST_TYPE`). */
    recordType: text().$type<ViewListType>().notNull(),
    name: text().notNull(),
    filter: jsonb().$type<ConditionGroup>(),
    search: text(),
    /** Column ids in order; null: the list's default columns. */
    columns: jsonb().$type<string[]>(),
    sort: jsonb().$type<ViewSort>(),
    shared: boolean().default(false).notNull(),
    createdBy: text().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_views_org_type_idx').on(table.orgId, table.recordType),
    check(
      'core_views_record_type_check',
      inListOrMatch(table.recordType, VIEW_RECORD_TYPES, PLUGIN_LIST_TYPE),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_views_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
