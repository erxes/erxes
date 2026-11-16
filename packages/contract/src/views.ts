import {
  FILTER_FIELD_GROUPS,
  FILTER_FIELD_TYPES,
  SORT_DIRECTIONS,
  VIEW_RECORD_TYPES,
} from '@erxes/core-db/enums';
import { views } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { ConditionGroup } from '@erxes/core-db/automationDefinition';
import { Id, isoDate, listOf } from './common';
import { PluginViewType } from './values';

/** The list a view belongs to: customers, leads (people), companies, company leads, products. */
export const ViewRecordType = z.enum(VIEW_RECORD_TYPES);

export type ViewRecordType = z.infer<typeof ViewRecordType>;

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
  /** The heading to list it under instead of the group's own: a plugin's title (`plugin`). */
  groupLabel: z.string().optional(),
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

/** The most record ids one `views.matches` call checks. */
export const VIEW_MATCHES_MAX = 500;

const { INVALID_TYPE, VIEW_NOT_SHARED } = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({ ...COMMON_ERRORS, INVALID_TYPE, VIEW_NOT_SHARED });

/** Saved lists (views) and what lists can be filtered by. */
export const viewsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/views',
      summary:
        "Views of a list (core's, or a plugin's `<plugin>:<record>`): the member's own and the team's shared ones. A plugin (`views:read`) gets the shared ones",
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
  matches: base
    .route({
      method: 'POST',
      path: '/views/{viewId}/matches',
      summary:
        "Which of the given records a shared view's filter and search match now (plugins with `views:read`; a segment for prices, audiences). Customer, lead, company and company lead views; up to 500 ids, others' and unknown ones never match. 403 VIEW_NOT_SHARED for a member's own view, 400 INVALID_TYPE for another list's",
    })
    .input(z.object({ viewId: Id, recordIds: z.array(Id).min(1).max(VIEW_MATCHES_MAX) }))
    .output(z.object({ recordIds: z.array(Id) })),
};
