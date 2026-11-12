import type { LeadRecordType } from '@erxes/core-contract';
import { type companies, type customers, type Db, leadEvents, newId } from '@erxes/core-db';
import type { Caller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { currentImport } from '~/lib/causation';
import { recordActivity } from '~/modules/activities/activities.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { findStage, firstStage, type StageRow } from './stages';

/**
 * A lead's lifecycle, planned by the customer and company services before
 * they write: its stage, conversion and reopening. Every step is kept
 * (`core_lead_events`) for the funnel, time in each stage and conversion rates.
 */

type CustomerRow = typeof customers.$inferSelect;

export interface LeadStep {
  event: 'created' | 'stage' | 'converted' | 'reopened';
  from: StageRow | null;
  to: StageRow | null;
  reason: string | null;
}

export interface LeadPlan {
  /** Columns to write on the person or company (they share them). */
  set: Partial<typeof customers.$inferInsert> & Partial<typeof companies.$inferInsert>;
  steps: LeadStep[];
}

interface LeadInput {
  state?: 'lead' | 'customer';
  leadStageId?: string;
  disqualifyReason?: string | null;
  source?: string | null;
  sourceDetails?: Record<string, string>;
}

/** Where someone came from when nobody said: an import, a plugin, or a member typing them in. */
const callerSource = (
  caller: Caller,
): { source: string; sourceDetails: Record<string, string> } => {
  if (currentImport()) return { source: 'import', sourceDetails: {} };

  return caller.actorType === 'plugin'
    ? { source: 'plugin', sourceDetails: { plugin: caller.actorId } }
    : { source: 'manual', sourceDetails: {} };
};

/** A new customer or lead: its source, and a lead's first stage. */
export const planLeadOnCreate = async (
  client: Db,
  caller: Caller,
  input: LeadInput,
): Promise<LeadPlan> => {
  const fallback = callerSource(caller);

  const origin = {
    source: input.source ?? fallback.source,
    sourceDetails: input.sourceDetails ?? (input.source ? {} : fallback.sourceDetails),
  };

  if ((input.state ?? 'customer') !== 'lead') {
    if (input.leadStageId) throw new HttpError(400, 'NOT_A_LEAD', 'Only leads have a lead stage');

    return { set: origin, steps: [] };
  }

  const stage = input.leadStageId
    ? await findStage(client, caller.orgId, input.leadStageId)
    : await firstStage(client, caller.orgId, 'open');

  const reason = stage?.kind === 'disqualified' ? (input.disqualifyReason ?? null) : null;

  return {
    set: {
      ...origin,
      leadStageId: stage?.id ?? null,
      leadStageChangedAt: new Date(),
      disqualifyReason: reason,
    },
    steps: [{ event: 'created', from: null, to: stage, reason }],
  };
};

interface Change {
  client: Db;
  caller: Caller;
  current: Pick<CustomerRow, 'state' | 'leadStageId'>;
  currentStage: StageRow | null;
  /** The stage asked for, when it differs from the current one. */
  wanted: StageRow | null;
  reason: string | null;
}

/** Lead → customer: moved to the first qualified stage unless already in one. */
const convert = async ({
  client,
  caller,
  current,
  currentStage,
  wanted,
}: Change): Promise<LeadPlan> => {
  let to = wanted ?? currentStage;

  if (to?.kind !== 'qualified') to = (await firstStage(client, caller.orgId, 'qualified')) ?? to;

  const set: LeadPlan['set'] = {
    convertedAt: new Date(),
    convertedBy: caller.actorType === 'user' ? caller.actorId : null,
    leadStageId: to?.id ?? null,
    disqualifyReason: null,
    ...(to?.id === current.leadStageId ? {} : { leadStageChangedAt: new Date() }),
  };

  return { set, steps: [{ event: 'converted', from: currentStage, to, reason: null }] };
};

/** Customer → lead: back to the first open stage, unless one was asked for. */
const reopen = async ({
  client,
  caller,
  currentStage,
  wanted,
  reason,
}: Change): Promise<LeadPlan> => {
  const to = wanted ?? (await firstStage(client, caller.orgId, 'open'));

  const set: LeadPlan['set'] = {
    convertedAt: null,
    convertedBy: null,
    leadStageId: to?.id ?? null,
    leadStageChangedAt: new Date(),
    disqualifyReason: to?.kind === 'disqualified' ? reason : null,
  };

  return { set, steps: [{ event: 'reopened', from: currentStage, to, reason }] };
};

/** The lifecycle part of a change: one step at most. */
const lifecyclePlan = async (
  change: Change,
  nextState: 'lead' | 'customer',
  input: LeadInput,
): Promise<LeadPlan> => {
  const { current, currentStage, wanted, reason } = change;

  if (current.state === 'lead' && nextState === 'customer') return convert(change);

  if (current.state === 'customer' && nextState === 'lead') return reopen(change);

  if (wanted) {
    if (current.state !== 'lead')
      throw new HttpError(400, 'NOT_A_LEAD', 'Only leads move between lead stages');

    return {
      set: {
        leadStageId: wanted.id,
        leadStageChangedAt: new Date(),
        disqualifyReason: wanted.kind === 'disqualified' ? reason : null,
      },
      steps: [{ event: 'stage', from: currentStage, to: wanted, reason }],
    };
  }

  if (input.disqualifyReason !== undefined && currentStage?.kind === 'disqualified')
    return { set: { disqualifyReason: input.disqualifyReason }, steps: [] };

  return { set: {}, steps: [] };
};

/**
 * A change to a customer: a stage move, a conversion (lead → customer: moved
 * to the first qualified stage unless already there), or a reopening
 * (customer → lead: back to the first open stage).
 */
export const planLeadOnUpdate = async (
  client: Db,
  caller: Caller,
  current: Pick<CustomerRow, 'state' | 'leadStageId'>,
  input: LeadInput,
): Promise<LeadPlan> => {
  const currentStage = current.leadStageId
    ? await findStage(client, caller.orgId, current.leadStageId).catch(() => null)
    : null;

  const wanted =
    input.leadStageId && input.leadStageId !== current.leadStageId
      ? await findStage(client, caller.orgId, input.leadStageId)
      : null;

  const plan = await lifecyclePlan(
    { client, caller, current, currentStage, wanted, reason: input.disqualifyReason ?? null },
    input.state ?? current.state,
    input,
  );

  if (input.source !== undefined) plan.set.source = input.source;

  if (input.sourceDetails !== undefined) plan.set.sourceDetails = input.sourceDetails;

  return plan;
};

const stageRef = (stage: StageRow | null) =>
  stage ? { id: stage.id, name: stage.name, kind: stage.kind, color: stage.color } : null;

/** Writes the steps: the lead's history, its timeline, and `core.lead.*` events for automations and webhooks. */
export const recordLeadSteps = async (
  tx: Db,
  caller: Caller,
  recordType: LeadRecordType,
  recordId: string,
  steps: LeadStep[],
) => {
  if (!steps.length) return;

  await tx.insert(leadEvents).values(
    steps.map((step) => ({
      id: newId(),
      orgId: caller.orgId,
      customerId: recordType === 'customer' ? recordId : null,
      companyId: recordType === 'company' ? recordId : null,
      event: step.event,
      fromStageId: step.from?.id ?? null,
      toStageId: step.to?.id ?? null,
      reason: step.reason,
      actorType: caller.actorType,
      actorId: caller.actorId,
    })),
  );

  // Creation is on the timeline already (customer.created).
  const moves = steps.map((step) => ({
    event: step.event,
    from: stageRef(step.from),
    to: stageRef(step.to),
    reason: step.reason,
  }));

  const changes = moves.filter((move) => move.event !== 'created');

  await recordActivity(
    tx,
    caller,
    changes.map((data) => ({
      targetType: recordType,
      targetId: recordId,
      type: `${recordType}.lead`,
      data,
    })),
  );
  await publishCoreEvents(
    tx,
    caller,
    changes.map((payload) => ({
      type: payload.event === 'converted' ? 'core.lead.converted' : 'core.lead.stage_changed',
      subject: { type: recordType, id: recordId },
      payload,
    })),
  );
};
