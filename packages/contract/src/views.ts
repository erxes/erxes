import {
  FILTER_FIELD_GROUPS,
  FILTER_FIELD_TYPES,
  SORT_DIRECTIONS,
  VIEW_RECORD_TYPES,
} from '@erxes/core-db/enums';
import { views } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { ConditionGroup } from './automationDefinition';
import { Id, isoDate, listOf } from './common';

/** The list a view belongs to: customers, leads (people), companies, company leads, products. */
export const ViewRecordType = z.enum(VIEW_RECORD_TYPES);

export type ViewRecordType = z.infer<typeof ViewRecordType>;

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

/** Saved lists (views) and what lists can be filtered by. */
export const viewsContract = {
  list: oc
    .route({
      method: 'GET',
      path: '/views',
      summary: "Views of a list: the member's own and the team's shared ones",
    })
    .input(z.object({ recordType: ViewRecordType }))
    .output(listOf(View)),
  create: oc
    .route({
      method: 'POST',
      path: '/views',
      successStatus: 201,
      summary:
        'Save a view (sharing it with the team needs contacts.edit; for products, products.manage)',
    })
    .input(ViewFields.required({ name: true }).extend({ recordType: ViewRecordType }))
    .output(View),
  update: oc
    .route({
      method: 'PATCH',
      path: '/views/{id}',
      summary:
        'Change a view (its creator; a shared one also members who may share: contacts.edit, products.manage)',
    })
    .input(ViewFields.extend({ id: Id }))
    .output(View),
  remove: oc
    .route({ method: 'DELETE', path: '/views/{id}' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  fields: oc
    .route({
      method: 'GET',
      path: '/views/fields',
      summary: 'What a list can be filtered by: fields, custom fields, the company, activity',
    })
    .input(z.object({ recordType: ViewRecordType }))
    .output(listOf(FilterField)),
};
