import { CONTENT_TYPES, CUSTOMER_STATES, LEAD_STAGE_KINDS } from '@erxes/core-db/enums';
import { leadEvents, leadStages } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';

/** `open`: still being worked; `qualified`: ready to become a customer; `disqualified`: lost. */
export const LeadStageKind = z.enum(LEAD_STAGE_KINDS);

export type LeadStageKind = z.infer<typeof LeadStageKind>;

/** Where people come from. Plugins and integrations may send others. */
export const LEAD_SOURCES = [
  'manual',
  'import',
  'form',
  'website',
  'email',
  'phone',
  'chat',
  'social',
  'ads',
  'referral',
  'event',
  'partner',
  'plugin',
  /** Signed up with a code on core's customer sign-in page. */
  'sign_in',
  'api',
  'other',
] as const;

export const LeadSource = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9_.:-]{0,49}$/, 'letters, digits, _ . : -');

/** Campaign, medium, referrer, page, form …: up to 20 short values. */
export const SourceDetails = z
  .record(z.string().max(50), z.string().max(500))
  .refine((value) => Object.keys(value).length <= 20, 'at most 20 details');

/** Whom a lead action is about: people or companies (both go through the same stages). */
export const LeadRecordType = z.enum(CONTENT_TYPES);

export type LeadRecordType = z.infer<typeof LeadRecordType>;

/** `lead`: not a customer yet. People and companies alike. */
export const ContactState = z.enum(CUSTOMER_STATES);

/**
 * The lifecycle columns every contact (person or company) carries:
 * `state`, `leadStageId` (stays after conversion), `leadStageChangedAt`,
 * `disqualifyReason`, `source` (`manual`, `form`, `plugin`, …),
 * `sourceDetails`, `convertedAt` and `lastActivityAt` (newest timeline
 * entry, creation counts).
 */
export const LIFECYCLE_COLUMNS = {
  state: true,
  leadStageId: true,
  leadStageChangedAt: true,
  disqualifyReason: true,
  source: true,
  sourceDetails: true,
  convertedAt: true,
  lastActivityAt: true,
} as const;

/** How the lifecycle columns read (`createSelectSchema` refinements). */
export const lifecycleRow = {
  leadStageChangedAt: isoDate,
  sourceDetails: z.record(z.string(), z.string()),
  convertedAt: isoDate,
  lastActivityAt: isoDate,
};

/**
 * What a create or update may set (`createUpdateSchema` refinements): a lead
 * stage (moving to a disqualified one takes `disqualifyReason`), and the
 * source, set when created (later changes are corrections).
 */
export const lifecycleInput = {
  leadStageId: Id.optional(),
  disqualifyReason: () => z.string().trim().max(500),
  source: () => LeadSource,
  sourceDetails: () => SourceDetails,
};

/** The lifecycle columns a create or update may set. */
export const LIFECYCLE_INPUT_COLUMNS = {
  state: true,
  leadStageId: true,
  disqualifyReason: true,
  source: true,
  sourceDetails: true,
} as const;

export const LeadStage = createSelectSchema(leadStages, { id: Id, order: () => z.int() })
  .pick({ id: true, name: true, kind: true, color: true, order: true })
  .extend({
    /** People who are leads in it now. */
    leadCount: z.int(),
    /** Companies that are leads in it now. */
    companyLeadCount: z.int(),
  });

export type LeadStage = z.infer<typeof LeadStage>;

const StageFields = createUpdateSchema(leadStages, {
  name: (name) => name.trim().min(1).max(60),
  color: (color) => color.regex(/^#[0-9a-fA-F]{6}$/, '#rrggbb'),
}).pick({ name: true, kind: true, color: true });

export const LeadEvent = createSelectSchema(leadEvents, { id: Id, createdAt: isoDate })
  .pick({
    id: true,
    event: true,
    fromStageId: true,
    toStageId: true,
    reason: true,
    actorType: true,
    actorId: true,
    createdAt: true,
  })
  .extend({ recordType: LeadRecordType, recordId: Id });

export type LeadEvent = z.infer<typeof LeadEvent>;

const Count = z.object({ count: z.int() });

export const LeadReport = z.object({
  recordType: LeadRecordType,
  from: z.iso.datetime(),
  to: z.iso.datetime(),
  /** Leads made in the period. */
  created: z.int(),
  /** Leads that became customers in the period. */
  converted: z.int(),
  disqualified: z.int(),
  /** converted ÷ (converted + disqualified + still open), of the period's leads; 0–1. */
  conversionRate: z.number(),
  /** Days from lead to customer: median and average, of the period's conversions. */
  daysToConvert: z.object({ median: z.number().nullable(), average: z.number().nullable() }),
  /** Every stage: leads in it now, leads that reached it in the period, average days spent in it. */
  stages: z.array(
    z.object({
      stageId: Id,
      name: z.string(),
      kind: LeadStageKind,
      color: z.string(),
      current: z.int(),
      reached: z.int(),
      averageDays: z.number().nullable(),
    }),
  ),
  bySource: z.array(Count.extend({ source: z.string().nullable(), converted: z.int() })),
  byOwner: z.array(Count.extend({ ownerId: z.string().nullable(), converted: z.int() })),
  /** Disqualification reasons, most common first. */
  reasons: z.array(Count.extend({ reason: z.string() })),
});

export type LeadReport = z.infer<typeof LeadReport>;

const Ids = z.array(Id).min(1).max(100);
const RecordTypeInput = { recordType: LeadRecordType.default('customer') };

export const leadsContract = {
  stages: oc
    .route({
      method: 'GET',
      path: '/lead-stages',
      summary: 'The lead stages, in order, with how many leads each holds',
    })
    .output(listOf(LeadStage)),
  createStage: oc
    .route({ method: 'POST', path: '/lead-stages', successStatus: 201 })
    .input(StageFields.required({ name: true }))
    .output(LeadStage),
  updateStage: oc
    .route({ method: 'PATCH', path: '/lead-stages/{id}' })
    .input(StageFields.extend({ id: Id }))
    .output(LeadStage),
  reorderStages: oc
    .route({
      method: 'POST',
      path: '/lead-stages/reorder',
      summary: 'Every stage id, in the new order',
    })
    .input(z.object({ ids: z.array(Id).min(1).max(50) }))
    .output(z.object({ ok: z.literal(true) })),
  removeStage: oc
    .route({
      method: 'POST',
      path: '/lead-stages/{id}/remove',
      summary:
        'Delete a stage; its leads move to `moveTo` (required when it has any). The last open stage stays',
    })
    .input(z.object({ id: Id, moveTo: Id.optional() }))
    .output(z.object({ moved: z.int() })),
  move: oc
    .route({
      method: 'POST',
      path: '/leads/move',
      summary: 'Move leads to a stage (a disqualified stage takes a reason)',
    })
    .input(
      z.object({
        ...RecordTypeInput,
        ids: Ids,
        stageId: Id,
        reason: z.string().trim().max(500).optional(),
      }),
    )
    .output(z.object({ moved: z.int() })),
  convert: oc
    .route({
      method: 'POST',
      path: '/leads/convert',
      summary:
        'Leads become customers: optionally given an owner, and (people) linked to a company',
    })
    .input(
      z.object({ ...RecordTypeInput, ids: Ids, ownerId: Id.optional(), companyId: Id.optional() }),
    )
    .output(z.object({ converted: z.int() })),
  history: oc
    .route({
      method: 'GET',
      path: '/leads/{id}/history',
      summary: "A lead's journey: created, every stage, converted",
    })
    .input(z.object({ ...RecordTypeInput, id: Id }))
    .output(listOf(LeadEvent)),
  report: oc
    .route({
      method: 'GET',
      path: '/leads/report',
      summary:
        'Funnel, conversion, sources, owners and reasons for a period (default: last 30 days)',
    })
    .input(
      z.object({
        ...RecordTypeInput,
        from: z.iso.datetime().optional(),
        to: z.iso.datetime().optional(),
      }),
    )
    .output(LeadReport),
};
