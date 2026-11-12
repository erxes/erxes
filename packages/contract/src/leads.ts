import { oc } from '@orpc/contract';
import { z } from 'zod';
import { Id } from './common';

/** `open`: still being worked; `qualified`: ready to become a customer; `disqualified`: lost. */
export const LeadStageKind = z.enum(['open', 'qualified', 'disqualified']);
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
export const LeadRecordType = z.enum(['customer', 'company']);
export type LeadRecordType = z.infer<typeof LeadRecordType>;

/** `lead`: not a customer yet. People and companies alike. */
export const ContactState = z.enum(['lead', 'customer']);

/** The lifecycle every contact (person or company) carries. */
export const LifecycleFields = {
  state: ContactState,
  /** The lead stage (`/lead-stages`); stays after conversion. */
  leadStageId: z.string().nullable(),
  leadStageChangedAt: z.string().datetime().nullable(),
  disqualifyReason: z.string().nullable(),
  /** Where they came from (`manual`, `form`, `plugin`, …). */
  source: z.string().nullable(),
  sourceDetails: z.record(z.string(), z.string()),
  /** When the lead became a customer. */
  convertedAt: z.string().datetime().nullable(),
  /** Newest timeline entry (creation counts). */
  lastActivityAt: z.string().datetime(),
};

/** Lifecycle fields a create or update may set. */
export const LifecycleInput = {
  state: ContactState.optional(),
  /** A lead stage; moving to a disqualified one takes `disqualifyReason`. */
  leadStageId: Id.optional(),
  disqualifyReason: z.string().trim().max(500).nullable().optional(),
  /** Set when created (later changes are corrections). */
  source: LeadSource.nullable().optional(),
  sourceDetails: SourceDetails.optional(),
};

export const LeadStage = z.object({
  id: Id,
  name: z.string(),
  kind: LeadStageKind,
  color: z.string(),
  order: z.number().int(),
  /** People who are leads in it now. */
  leadCount: z.number().int(),
  /** Companies that are leads in it now. */
  companyLeadCount: z.number().int(),
});
export type LeadStage = z.infer<typeof LeadStage>;

const StageFields = z.object({
  name: z.string().trim().min(1).max(60),
  kind: LeadStageKind.optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, '#rrggbb')
    .optional(),
});

export const LeadEvent = z.object({
  id: Id,
  recordType: LeadRecordType,
  recordId: Id,
  event: z.enum(['created', 'stage', 'converted', 'reopened']),
  fromStageId: z.string().nullable(),
  toStageId: z.string().nullable(),
  reason: z.string().nullable(),
  actorType: z.string(),
  actorId: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type LeadEvent = z.infer<typeof LeadEvent>;

const Count = z.object({ count: z.number().int() });

export const LeadReport = z.object({
  recordType: LeadRecordType,
  from: z.string().datetime(),
  to: z.string().datetime(),
  /** Leads made in the period. */
  created: z.number().int(),
  /** Leads that became customers in the period. */
  converted: z.number().int(),
  disqualified: z.number().int(),
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
      current: z.number().int(),
      reached: z.number().int(),
      averageDays: z.number().nullable(),
    }),
  ),
  bySource: z.array(Count.extend({ source: z.string().nullable(), converted: z.number().int() })),
  byOwner: z.array(Count.extend({ ownerId: z.string().nullable(), converted: z.number().int() })),
  /** Disqualification reasons, most common first. */
  reasons: z.array(Count.extend({ reason: z.string() })),
});
export type LeadReport = z.infer<typeof LeadReport>;

const Ids = z.array(Id).min(1).max(100);
const RecordTypeInput = { recordType: LeadRecordType.default('customer') };

export const leadsContract = {
  stages: oc
    .route({ method: 'GET', path: '/lead-stages', summary: 'The lead stages, in order, with how many leads each holds' })
    .output(z.object({ data: z.array(LeadStage) })),
  createStage: oc
    .route({ method: 'POST', path: '/lead-stages', successStatus: 201 })
    .input(StageFields)
    .output(LeadStage),
  updateStage: oc
    .route({ method: 'PATCH', path: '/lead-stages/{id}' })
    .input(StageFields.partial().extend({ id: Id }))
    .output(LeadStage),
  reorderStages: oc
    .route({ method: 'POST', path: '/lead-stages/reorder', summary: 'Every stage id, in the new order' })
    .input(z.object({ ids: z.array(Id).min(1).max(50) }))
    .output(z.object({ ok: z.literal(true) })),
  removeStage: oc
    .route({
      method: 'POST',
      path: '/lead-stages/{id}/remove',
      summary: 'Delete a stage; its leads move to `moveTo` (required when it has any). The last open stage stays',
    })
    .input(z.object({ id: Id, moveTo: Id.optional() }))
    .output(z.object({ moved: z.number().int() })),
  move: oc
    .route({ method: 'POST', path: '/leads/move', summary: 'Move leads to a stage (a disqualified stage takes a reason)' })
    .input(z.object({ ...RecordTypeInput, ids: Ids, stageId: Id, reason: z.string().trim().max(500).optional() }))
    .output(z.object({ moved: z.number().int() })),
  convert: oc
    .route({
      method: 'POST',
      path: '/leads/convert',
      summary: 'Leads become customers: optionally given an owner, and (people) linked to a company',
    })
    .input(z.object({ ...RecordTypeInput, ids: Ids, ownerId: Id.optional(), companyId: Id.optional() }))
    .output(z.object({ converted: z.number().int() })),
  history: oc
    .route({ method: 'GET', path: '/leads/{id}/history', summary: "A lead's journey: created, every stage, converted" })
    .input(z.object({ ...RecordTypeInput, id: Id }))
    .output(z.object({ data: z.array(LeadEvent) })),
  report: oc
    .route({ method: 'GET', path: '/leads/report', summary: 'Funnel, conversion, sources, owners and reasons for a period (default: last 30 days)' })
    .input(z.object({ ...RecordTypeInput, from: z.string().datetime().optional(), to: z.string().datetime().optional() }))
    .output(LeadReport),
};
