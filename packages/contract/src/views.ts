import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ConditionGroup } from './automationDefinition';
import { Id } from './common';

/** The list a view belongs to: customers, leads (people), companies, company leads. */
export const ViewRecordType = z.enum(['customer', 'lead', 'company', 'company_lead']);

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
  type: z.enum(['text', 'number', 'date', 'boolean', 'select', 'member', 'tags']),
  options: z.array(z.string()).optional(),
  /** Where it comes from, for grouping in the picker. */
  group: z.enum(['fields', 'lead', 'custom', 'company', 'activity']),
});

export type FilterField = z.infer<typeof FilterField>;

export const ViewSort = z.object({
  field: z.string().max(100),
  direction: z.enum(['asc', 'desc']),
});

export const View = z.object({
  id: Id,
  recordType: ViewRecordType,
  name: z.string(),
  filter: ConditionGroup.nullable(),
  search: z.string().nullable(),
  columns: z.array(z.string()).nullable(),
  sort: ViewSort.nullable(),
  /** Seen by the whole team; otherwise only by its creator. */
  shared: z.boolean(),
  createdBy: Id,
  /** The signed-in member may change or delete it. */
  editable: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type View = z.infer<typeof View>;

const ViewFields = {
  name: z.string().trim().min(1).max(80),
  filter: ConditionGroup.nullable().optional(),
  search: z.string().trim().max(100).nullable().optional(),
  columns: z.array(z.string().max(100)).max(100).nullable().optional(),
  sort: ViewSort.nullable().optional(),
  shared: z.boolean().optional(),
};

/** Saved lists (views) and what lists can be filtered by. */
export const viewsContract = {
  list: oc
    .route({
      method: 'GET',
      path: '/views',
      summary: "Views of a list: the member's own and the team's shared ones",
    })
    .input(z.object({ recordType: ViewRecordType }))
    .output(z.object({ data: z.array(View) })),
  create: oc
    .route({
      method: 'POST',
      path: '/views',
      successStatus: 201,
      summary: 'Save a view (sharing it with the team needs contacts.edit)',
    })
    .input(z.object({ recordType: ViewRecordType, ...ViewFields }))
    .output(View),
  update: oc
    .route({
      method: 'PATCH',
      path: '/views/{id}',
      summary: 'Change a view (its creator; a shared one also members with contacts.edit)',
    })
    .input(z.object({ id: Id, ...ViewFields, name: ViewFields.name.optional() }))
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
    .output(z.object({ data: z.array(FilterField) })),
};
