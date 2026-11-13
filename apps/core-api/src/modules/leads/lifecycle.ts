import type { LeadRecordType } from '@erxes/core-contract';
import type { CUSTOMER_STATES, LEAD_EVENTS } from '@erxes/core-db/enums';
import { type companies, type customers, type Db, leadEvents, newId } from '@erxes/core-db';
import type { Caller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { currentImport } from '~/lib/causation';
import { recordActivity } from '~/modules/activities/activities.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { findStage, firstStage, type StageRow, stagesOf } from './stages';

/**
 * A lead's lifecycle, planned by the customer and company services before
 * they write: its stage, conversion and reopening. Every step is kept
 * (`core_lead_events`) for the funnel, time in each stage and conversion rates.
 */

type CustomerRow = typeof customers.$inferSelect;

export interface LeadStep {
  event: (typeof LEAD_EVENTS)[number];
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
  state?: (typeof CUSTOMER_STATES)[number];
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
  caller: Caller;
  stages: StageRow[];
  current: Pick<CustomerRow, 'state' | 'leadStageId'>;
  currentStage: StageRow | null;
  /** The stage asked for, when it differs from the current one. */
  wanted: StageRow | null;
  reason: string | null;
  now: Date;
}

const firstOf = (stages: StageRow[], kind: StageRow['kind']) =>
  stages.find((stage) => stage.kind === kind) ?? null;

/** Lead → customer: moved to the first qualified stage unless already in one. */
const convert = ({ caller, stages, current, currentStage, wanted, now }: Change): LeadPlan => {
  let to = wanted ?? currentStage;

  if (to?.kind !== 'qualified') to = firstOf(stages, 'qualified') ?? to;

  const set: LeadPlan['set'] = {
    convertedAt: now,
    convertedBy: caller.actorType === 'user' ? caller.actorId : null,
    leadStageId: to?.id ?? null,
    disqualifyReason: null,
    ...(to?.id === current.leadStageId ? {} : { leadStageChangedAt: now }),
  };

  return { set, steps: [{ event: 'converted', from: currentStage, to, reason: null }] };
};

/** Customer → lead: back to the first open stage, unless one was asked for. */
const reopen = ({ stages, currentStage, wanted, reason, now }: Change): LeadPlan => {
  const to = wanted ?? firstOf(stages, 'open');

  const set: LeadPlan['set'] = {
    convertedAt: null,
    convertedBy: null,
    leadStageId: to?.id ?? null,
    leadStageChangedAt: now,
    disqualifyReason: to?.kind === 'disqualified' ? reason : null,
  };

  return { set, steps: [{ event: 'reopened', from: currentStage, to, reason }] };
};

/** The lifecycle part of a change: one step at most. */
const lifecyclePlan = (
  change: Change,
  nextState: (typeof CUSTOMER_STATES)[number],
  input: LeadInput,
): LeadPlan => {
  const { current, currentStage, wanted, reason, now } = change;

  if (current.state === 'lead' && nextState === 'customer') return convert(change);

  if (current.state === 'customer' && nextState === 'lead') return reopen(change);

  if (wanted) {
    if (current.state !== 'lead')
      throw new HttpError(400, 'NOT_A_LEAD', 'Only leads move between lead stages');

    return {
      set: {
        leadStageId: wanted.id,
        leadStageChangedAt: now,
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
 * A change to a customer or company, planned on the organisation's stages
 * (loaded once for many records in bulk moves): a stage move, a conversion
 * (lead → customer: moved to the first qualified stage unless already
 * there), or a reopening (customer → lead: back to the first open stage).
 * `asked` is the stage `input.leadStageId` names, found already.
 */
export const planLeadChange = ({
  caller,
  stages,
  current,
  input,
  asked,
  now = new Date(),
}: {
  caller: Caller;
  stages: StageRow[];
  current: Pick<CustomerRow, 'state' | 'leadStageId'>;
  input: LeadInput;
  asked: StageRow | null;
  now?: Date;
}): LeadPlan => {
  const plan = lifecyclePlan(
    {
      caller,
      stages,
      current,
      currentStage: stages.find((stage) => stage.id === current.leadStageId) ?? null,
      wanted: asked?.id === current.leadStageId ? null : asked,
      reason: input.disqualifyReason ?? null,
      now,
    },
    input.state ?? current.state,
    input,
  );

  if (input.source !== undefined) plan.set.source = input.source;

  if (input.sourceDetails !== undefined) plan.set.sourceDetails = input.sourceDetails;

  return plan;
};

/** `planLeadChange` for one record, loading only the stages it needs. */
export const planLeadOnUpdate = async (
  client: Db,
  caller: Caller,
  current: Pick<CustomerRow, 'state' | 'leadStageId'>,
  input: LeadInput,
): Promise<LeadPlan> => {
  const asked =
    input.leadStageId && input.leadStageId !== current.leadStageId
      ? await findStage(client, caller.orgId, input.leadStageId)
      : null;

  // The stages are needed for the current one, and for a conversion or reopening.
  const stages =
    current.leadStageId || (input.state ?? current.state) !== current.state
      ? await stagesOf(client, caller.orgId)
      : [];

  return planLeadChange({ caller, stages, current, input, asked });
};

const stageRef = (stage: StageRow | null) =>
  stage ? { id: stage.id, name: stage.name, kind: stage.kind, color: stage.color } : null;

/** Writes the records' steps: their history, their timelines, and `core.lead.*` events for automations and webhooks. */
export const recordLeadSteps = async (
  tx: Db,
  caller: Caller,
  recordType: LeadRecordType,
  records: { id: string; steps: LeadStep[] }[],
) => {
  const steps = records.flatMap(({ id, steps: own }) => own.map((step) => ({ id, step })));

  if (!steps.length) return;

  await tx.insert(leadEvents).values(
    steps.map(({ id, step }) => ({
      id: newId(),
      customerId: recordType === 'customer' ? id : null,
      companyId: recordType === 'company' ? id : null,
      event: step.event,
      fromStageId: step.from?.id ?? null,
      toStageId: step.to?.id ?? null,
      reason: step.reason,
      actorType: caller.actorType,
      actorId: caller.actorId,
    })),
  );

  // Creation is on the timeline already (customer.created).
  const changes = steps
    .filter(({ step }) => step.event !== 'created')
    .map(({ id, step }) => ({
      id,
      data: {
        event: step.event,
        from: stageRef(step.from),
        to: stageRef(step.to),
        reason: step.reason,
      },
    }));

  await recordActivity(
    tx,
    caller,
    changes.map(({ id, data }) => ({
      targetType: recordType,
      targetId: id,
      type: `${recordType}.lead`,
      data,
    })),
  );
  await publishCoreEvents(
    tx,
    caller,
    changes.map(({ id, data }) => ({
      type: data.event === 'converted' ? 'core.lead.converted' : 'core.lead.stage_changed',
      subject: { type: recordType, id },
      payload: data,
    })),
  );
};
