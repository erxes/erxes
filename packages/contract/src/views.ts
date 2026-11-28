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
import { PluginListType } from './values';

/** The list a view belongs to: customers, leads (people), companies, company leads, products. */
export const ViewRecordType = z.enum(VIEW_RECORD_TYPES);

export type ViewRecordType = z.infer<typeof ViewRecordType>;

/** Any list views can belong to: one of core's, or a plugin's (`<plugin>:<record>`, whose API applies the filter). */
export const ViewListType = z.union([ViewRecordType, PluginListType]);

export type ViewListType = z.infer<typeof ViewListType>;

/**
 * A filter on a list: the condition language automations use, on the
 * record's fields (`subject.state`, `subject.data.<key>`, `subject.tagIds`,
 * `subject.company.industry`, `subject.company.data.<key>`, …). In list queries it goes
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
  /** A number that is money, in this currency's smallest unit. */
  currency: z.string().optional(),
  /**
   * A measure of a plugin's related records (`subject.related.<plugin>.<relation>.<measure>`):
   * a rule on it may narrow them with `where`, on these fields (`subject.<field>`).
   */
  relation: z
    .object({
      label: z.string(),
      fields: z.array(
        z.object({
          path: z.string(),
          label: z.string(),
          type: z.enum(FILTER_FIELD_TYPES),
          options: z.array(z.string()).optional(),
          currency: z.string().optional(),
        }),
      ),
    })
    .optional(),
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

/** What a view create or update may set. */
export const ViewFields = createUpdateSchema(views, {
  name: (name) => name.trim().min(1).max(80),
  filter: () => ConditionGroup,
  search: (search) => search.trim().max(100),
  columns: () => z.array(z.string().max(100)).max(100),
  sort: () => ViewSort,
}).pick({ name: true, filter: true, search: true, columns: true, sort: true, shared: true });

export type ViewFields = z.infer<typeof ViewFields>;

/** The most record ids one `views.matches` call checks. */
export const VIEW_MATCHES_MAX = 500;

const { INVALID_TYPE, VIEW_NOT_SHARED, VIEW_IN_USE } = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({ ...COMMON_ERRORS, INVALID_TYPE, VIEW_NOT_SHARED, VIEW_IN_USE });

/** Saved lists (views) and what lists can be filtered by. */
export const viewsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/views',
      summary: 'List saved views',
      description:
        "Views of a list (core's, or a plugin's `<plugin>:<record>`): the member's own and the team's shared ones. A plugin (`views:read`) gets the shared ones",
    })
    .input(z.object({ recordType: ViewListType }))
    .output(listOf(View)),
  create: base
    .route({
      method: 'POST',
      path: '/views',
      successStatus: 201,
      summary: 'Save a view',
      description:
        "Save a view (sharing it with the team needs contacts.edit; for products, products.manage; a plugin's list, none)",
    })
    .input(ViewFields.required({ name: true }).extend({ recordType: ViewListType }))
    .output(View),
  update: base
    .route({
      method: 'PATCH',
      path: '/views/{id}',
      summary: 'Change a view',
      description:
        'Change a view (its creator; a shared one also members who may share: contacts.edit, products.manage)',
    })
    .input(ViewFields.extend({ id: Id }))
    .output(View),
  remove: base
    .route({
      method: 'DELETE',
      path: '/views/{id}',
      summary: 'Delete a view',
      description: '409 VIEW_IN_USE while a draft or scheduled broadcast sends to the view',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  fields: base
    .route({
      method: 'GET',
      path: '/views/fields',
      summary: 'List filterable fields',
      description: 'What a list can be filtered by: fields, custom fields, the company, activity',
    })
    .input(z.object({ recordType: ViewRecordType }))
    .output(listOf(FilterField)),
  matches: base
    .route({
      method: 'POST',
      path: '/views/{viewId}/matches',
      summary: 'Match records against a view',
      description:
        "Which of the given records a shared view's filter and search match now (plugins with `views:read`; a segment for prices, audiences). Customer, lead, company and company lead views; up to 500 ids, others' and unknown ones never match. 403 VIEW_NOT_SHARED for a member's own view, 400 INVALID_TYPE for another list's",
    })
    .input(z.object({ viewId: Id, recordIds: z.array(Id).min(1).max(VIEW_MATCHES_MAX) }))
    .output(z.object({ recordIds: z.array(Id) })),
};
