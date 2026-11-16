import {
  FILTER_FIELD_GROUPS,
  FILTER_FIELD_TYPES,
  PLUGIN_VIEW_TYPE,
  SORT_DIRECTIONS,
  VIEW_RECORD_TYPES,
} from '@erxes/core-db/enums';
import { views } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { ConditionGroup } from '@erxes/core-db/automationDefinition';
import { Id, isoDate, listOf } from './common';

/** The list a view belongs to: customers, leads (people), companies, company leads, products. */
export const ViewRecordType = z.enum(VIEW_RECORD_TYPES);

export type ViewRecordType = z.infer<typeof ViewRecordType>;

/** A plugin's list: its record type, `<plugin>:<record>` (`sales:deal`). Its API applies the filter. */
export const PluginViewType = z
  .templateLiteral([z.string(), ':', z.string()])
  .refine((type) => new RegExp(PLUGIN_VIEW_TYPE).test(type), 'Expected <plugin>:<record>');

/** Any list views can belong to: one of core's, or a plugin's. */
export const ViewListType = z.union([ViewRecordType, PluginViewType]);

export type ViewListType = z.infer<typeof ViewListType>;

/**
 * A filter on a list: the condition language automations use, on the
 * record's fields (`subject.state`, `subject.customFields.<id>`,
 * `subject.tagIds`, `subject.company.industry`, …). In list queries it goes
 * as JSON in `filter`.
 */
export const RecordFilter = ConditionGroup;

/** One thing a list can be filtered by, with the operators that fit it. */
export const FilterField = z.object({
  path: z.string(),
  label: z.string(),
  type: z.enum(FILTER_FIELD_TYPES),
  options: z.array(z.string()).optional(),
  /** Where it comes from, for grouping in the picker. */
  group: z.enum(FILTER_FIELD_GROUPS),
});

export type FilterField = z.infer<typeof FilterField>;

export const ViewSort = z.object({
  field: z.string().max(100),
  direction: z.enum(SORT_DIRECTIONS),
});

export const View = createSelectSchema(views, {
  id: Id,
  recordType: () => ViewListType,
  filter: () => ConditionGroup,
  columns: () => z.array(z.string()),
  sort: () => ViewSort,
  createdBy: Id,
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    recordType: true,
    name: true,
    filter: true,
    search: true,
    columns: true,
    sort: true,
    /** Seen by the whole team; otherwise only by its creator. */
    shared: true,
    createdBy: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    /** The signed-in member may change or delete it. */
    editable: z.boolean(),
  });

export type View = z.infer<typeof View>;

const ViewFields = createUpdateSchema(views, {
  name: (name) => name.trim().min(1).max(80),
  filter: () => ConditionGroup,
  search: (search) => search.trim().max(100),
  columns: () => z.array(z.string().max(100)).max(100),
  sort: () => ViewSort,
}).pick({ name: true, filter: true, search: true, columns: true, sort: true, shared: true });

/** Views answer with the common errors only. */
const base = oc.errors(COMMON_ERRORS);

/** Saved lists (views) and what lists can be filtered by. */
export const viewsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/views',
      summary:
        "Views of a list (core's, or a plugin's `<plugin>:<record>`): the member's own and the team's shared ones",
    })
    .input(z.object({ recordType: ViewListType }))
    .output(listOf(View)),
  create: base
    .route({
      method: 'POST',
      path: '/views',
      successStatus: 201,
      summary:
        "Save a view (sharing it with the team needs contacts.edit; for products, products.manage; a plugin's list, none)",
    })
    .input(ViewFields.required({ name: true }).extend({ recordType: ViewListType }))
    .output(View),
  update: base
    .route({
      method: 'PATCH',
      path: '/views/{id}',
      summary:
        'Change a view (its creator; a shared one also members who may share: contacts.edit, products.manage)',
    })
    .input(ViewFields.extend({ id: Id }))
    .output(View),
  remove: base
    .route({ method: 'DELETE', path: '/views/{id}' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  fields: base
    .route({
      method: 'GET',
      path: '/views/fields',
      summary: 'What a list can be filtered by: fields, custom fields, the company, activity',
    })
    .input(z.object({ recordType: ViewRecordType }))
    .output(listOf(FilterField)),
};
