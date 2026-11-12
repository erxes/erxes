import type { LeadRecordType, LeadReport, LeadStageKind } from '@erxes/core-contract';
import { companies, customers, type Db, leadEvents, leadStages, newId } from '@erxes/core-db';
import { and, asc, eq, inArray, max, sql } from 'drizzle-orm';
import { type Actor, type Caller, userCaller } from '~/http/auth';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { currentImport } from '~/lib/causation';
import { recordActivity } from '~/modules/activities/activities.service';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';

/**
 * Leads: people who are not customers yet, moving through the organisation's
 * stages (New → Contacted → Engaged → Qualified, or Disqualified) until they
 * are converted. Every step is kept (`core_lead_events`) for the funnel,
 * time in each stage and conversion rates.
 */

type StageRow = typeof leadStages.$inferSelect;
type CustomerRow = typeof customers.$inferSelect;

/** People and companies carry the same lifecycle columns. */
const recordTable = (type: LeadRecordType) => (type === 'company' ? companies : customers);

export const DEFAULT_LEAD_STAGES: { name: string; kind: LeadStageKind; color: string }[] = [
  { name: 'New', kind: 'open', color: '#3b82f6' },
  { name: 'Contacted', kind: 'open', color: '#8b5cf6' },
  { name: 'Engaged', kind: 'open', color: '#f59e0b' },
  { name: 'Qualified', kind: 'qualified', color: '#10b981' },
  { name: 'Disqualified', kind: 'disqualified', color: '#94a3b8' },
];

/** A new organisation's stages. */
export const seedLeadStages = async (tx: Db, orgId: string) => {
  await tx.insert(leadStages).values(DEFAULT_LEAD_STAGES.map((stage, order) => ({ id: newId(), orgId, order, ...stage })));
};

const stagesOf = (client: Db, orgId: string) =>
  client.select().from(leadStages).where(eq(leadStages.orgId, orgId)).orderBy(asc(leadStages.order), asc(leadStages.createdAt));

const findStage = async (client: Db, orgId: string, id: string) => {
  const [stage] = await client
    .select()
    .from(leadStages)
    .where(and(eq(leadStages.orgId, orgId), eq(leadStages.id, id)))
    .limit(1);

  if (!stage) throw new HttpError(400, 'INVALID_LEAD_STAGE', 'Not a lead stage of this organisation', { stageId: id });

  return stage;
};

/** The first stage of a kind (in order), if any. */
const firstStage = async (client: Db, orgId: string, kind: LeadStageKind) =>
  (await stagesOf(client, orgId)).find((stage) => stage.kind === kind) ?? null;

const leadCounts = async (client: Db, orgId: string, type: LeadRecordType = 'customer') => {
  const table = recordTable(type);
  const rows = await client
    .select({ stageId: table.leadStageId, count: sql<number>`count(*)::int` })
    .from(table)
    .where(and(eq(table.orgId, orgId), eq(table.state, 'lead')))
    .groupBy(table.leadStageId);

  return new Map(rows.map((row) => [row.stageId, Number(row.count)]));
};

const toStageDto = (stage: StageRow, people: Map<string | null, number>, companyLeads: Map<string | null, number>) => ({
  id: stage.id,
  name: stage.name,
  kind: stage.kind,
  color: stage.color,
  order: stage.order,
  leadCount: people.get(stage.id) ?? 0,
  companyLeadCount: companyLeads.get(stage.id) ?? 0,
});

const allCounts = (client: Db, orgId: string) => Promise.all([leadCounts(client, orgId, 'customer'), leadCounts(client, orgId, 'company')]);

export const listLeadStages = async (client: Db, actor: Actor) => {
  const [stages, [people, companyLeads]] = await Promise.all([stagesOf(client, actor.orgId), allCounts(client, actor.orgId)]);

  return { data: stages.map((stage) => toStageDto(stage, people, companyLeads)) };
};

const stageTaken = (error: unknown): never => {
  if (pgCode(error) === '23505') throw new HttpError(409, 'LEAD_STAGE_EXISTS', 'A stage with this name already exists');

  throw error;
};

const audit = (tx: Db, actor: Actor, action: string, stage: StageRow) =>
  recordAudit(tx, userCaller(actor), { action, targetType: 'lead_stage', targetId: stage.id, targetLabel: stage.name });

export const createLeadStage = async (client: Db, actor: Actor, input: { name: string; kind?: LeadStageKind; color?: string }) =>
  client
    .transaction(async (tx) => {
      const [last] = await tx.select({ order: max(leadStages.order) }).from(leadStages).where(eq(leadStages.orgId, actor.orgId));
      const [stage] = await tx
        .insert(leadStages)
        .values({ id: newId(), orgId: actor.orgId, name: input.name, kind: input.kind ?? 'open', color: input.color ?? '#64748b', order: (last?.order ?? -1) + 1 })
        .returning();

      await audit(tx, actor, 'lead_stage.created', stage!);

      return toStageDto(stage!, new Map(), new Map());
    })
    .catch(stageTaken);

/** Some stage of each kind a lead can be moved to must stay: at least one open one. */
const assertOpenStageLeft = (stages: StageRow[], without: (stage: StageRow) => boolean) => {
  if (!stages.some((stage) => stage.kind === 'open' && !without(stage))) {
    throw new HttpError(409, 'LAST_OPEN_STAGE', 'Keep at least one open stage: new leads start there');
  }
};

export const updateLeadStage = async (client: Db, actor: Actor, id: string, input: { name?: string; kind?: LeadStageKind; color?: string }) =>
  client
    .transaction(async (tx) => {
      const stages = await stagesOf(tx, actor.orgId);
      const current = stages.find((stage) => stage.id === id);

      if (!current) throw notFound('Lead stage');
      if (input.kind && input.kind !== 'open') assertOpenStageLeft(stages, (stage) => stage.id === id);

      const [stage] = await tx
        .update(leadStages)
        .set({ ...input, updatedAt: sql`now()` })
        .where(and(eq(leadStages.orgId, actor.orgId), eq(leadStages.id, id)))
        .returning();

      await audit(tx, actor, 'lead_stage.updated', stage!);

      return toStageDto(stage!, ...(await allCounts(tx, actor.orgId)));
    })
    .catch(stageTaken);

export const reorderLeadStages = async (client: Db, actor: Actor, ids: string[]) =>
  client.transaction(async (tx) => {
    const stages = await stagesOf(tx, actor.orgId);

    if (ids.length !== stages.length || new Set(ids).size !== ids.length || stages.some((stage) => !ids.includes(stage.id))) {
      throw new HttpError(400, 'INVALID_INPUT', 'List every stage exactly once');
    }

    for (const [order, id] of ids.entries()) {
      await tx.update(leadStages).set({ order, updatedAt: sql`now()` }).where(and(eq(leadStages.orgId, actor.orgId), eq(leadStages.id, id)));
    }

    return { ok: true as const };
  });

/** Deletes a stage; everyone in it (leads, and customers who converted from it) moves to `moveTo`. */
export const removeLeadStage = async (client: Db, actor: Actor, id: string, moveTo: string | undefined) =>
  client.transaction(async (tx) => {
    const stages = await stagesOf(tx, actor.orgId);
    const stage = stages.find((item) => item.id === id);

    if (!stage) throw notFound('Lead stage');
    assertOpenStageLeft(stages, (item) => item.id === id);

    let count = 0;

    for (const table of [customers, companies]) {
      const [used] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(table)
        .where(and(eq(table.orgId, actor.orgId), eq(table.leadStageId, id)));

      count += Number(used?.count ?? 0);
    }

    if (count && (!moveTo || moveTo === id)) {
      throw new HttpError(409, 'LEAD_STAGE_IN_USE', `${count} leads are in this stage: choose where they move`, { count });
    }

    if (count) {
      await findStage(tx, actor.orgId, moveTo!);

      for (const table of [customers, companies]) {
        await tx
          .update(table)
          .set({ leadStageId: moveTo!, leadStageChangedAt: sql`now()` })
          .where(and(eq(table.orgId, actor.orgId), eq(table.leadStageId, id)));
      }
    }

    await tx.delete(leadStages).where(and(eq(leadStages.orgId, actor.orgId), eq(leadStages.id, id)));
    await audit(tx, actor, 'lead_stage.deleted', stage);

    return { moved: count };
  });

// ─── A lead's lifecycle (used by the customer service) ──────────────────────

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
const callerSource = (caller: Caller): { source: string; sourceDetails: Record<string, string> } =>
  currentImport()
    ? { source: 'import', sourceDetails: {} }
    : caller.actorType === 'plugin'
      ? { source: 'plugin', sourceDetails: { plugin: caller.actorId } }
      : { source: 'manual', sourceDetails: {} };

/** A new customer or lead: its source, and a lead's first stage. */
export const planLeadOnCreate = async (client: Db, caller: Caller, input: LeadInput): Promise<LeadPlan> => {
  const fallback = callerSource(caller);
  const origin = {
    source: input.source ?? fallback.source,
    sourceDetails: input.sourceDetails ?? (input.source ? {} : fallback.sourceDetails),
  };

  if ((input.state ?? 'customer') !== 'lead') {
    if (input.leadStageId) throw new HttpError(400, 'NOT_A_LEAD', 'Only leads have a lead stage');

    return { set: origin, steps: [] };
  }

  const stage = input.leadStageId ? await findStage(client, caller.orgId, input.leadStageId) : await firstStage(client, caller.orgId, 'open');
  const reason = stage?.kind === 'disqualified' ? (input.disqualifyReason ?? null) : null;

  return {
    set: { ...origin, leadStageId: stage?.id ?? null, leadStageChangedAt: new Date(), disqualifyReason: reason },
    steps: [{ event: 'created', from: null, to: stage, reason }],
  };
};

/**
 * A change to a customer: a stage move, a conversion (lead → customer: moved
 * to the first qualified stage unless already there), or a reopening
 * (customer → lead: back to the first open stage).
 */
export const planLeadOnUpdate = async (client: Db, caller: Caller, current: Pick<CustomerRow, 'state' | 'leadStageId'>, input: LeadInput): Promise<LeadPlan> => {
  const set: LeadPlan['set'] = {};
  const steps: LeadStep[] = [];
  const nextState = input.state ?? current.state;
  const currentStage = current.leadStageId ? await findStage(client, caller.orgId, current.leadStageId).catch(() => null) : null;
  const wanted = input.leadStageId && input.leadStageId !== current.leadStageId ? await findStage(client, caller.orgId, input.leadStageId) : null;
  const reason = input.disqualifyReason ?? null;

  if (current.state === 'lead' && nextState === 'customer') {
    let to = wanted ?? currentStage;

    if (to?.kind !== 'qualified') to = (await firstStage(client, caller.orgId, 'qualified')) ?? to;

    Object.assign(set, {
      convertedAt: new Date(),
      convertedBy: caller.actorType === 'user' ? caller.actorId : null,
      leadStageId: to?.id ?? null,
      disqualifyReason: null,
      ...(to?.id !== current.leadStageId ? { leadStageChangedAt: new Date() } : {}),
    });
    steps.push({ event: 'converted', from: currentStage, to, reason: null });
  } else if (current.state === 'customer' && nextState === 'lead') {
    const to = wanted ?? (await firstStage(client, caller.orgId, 'open'));

    Object.assign(set, {
      convertedAt: null,
      convertedBy: null,
      leadStageId: to?.id ?? null,
      leadStageChangedAt: new Date(),
      disqualifyReason: to?.kind === 'disqualified' ? reason : null,
    });
    steps.push({ event: 'reopened', from: currentStage, to, reason });
  } else if (wanted) {
    if (current.state !== 'lead') throw new HttpError(400, 'NOT_A_LEAD', 'Only leads move between lead stages');

    Object.assign(set, {
      leadStageId: wanted.id,
      leadStageChangedAt: new Date(),
      disqualifyReason: wanted.kind === 'disqualified' ? reason : null,
    });
    steps.push({ event: 'stage', from: currentStage, to: wanted, reason });
  } else if (input.disqualifyReason !== undefined && currentStage?.kind === 'disqualified') {
    set.disqualifyReason = input.disqualifyReason;
  }

  if (input.source !== undefined) set.source = input.source;
  if (input.sourceDetails !== undefined) set.sourceDetails = input.sourceDetails;

  return { set, steps };
};

const stageRef = (stage: StageRow | null) => (stage ? { id: stage.id, name: stage.name, kind: stage.kind, color: stage.color } : null);

/** Writes the steps: the lead's history, its timeline, and `core.lead.*` events for automations and webhooks. */
export const recordLeadSteps = async (tx: Db, caller: Caller, recordType: LeadRecordType, recordId: string, steps: LeadStep[]) => {
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
  const moves = steps.filter((step) => step.event !== 'created');

  await recordActivity(
    tx,
    caller,
    moves.map((step) => ({
      targetType: recordType,
      targetId: recordId,
      type: `${recordType}.lead`,
      data: { event: step.event, from: stageRef(step.from), to: stageRef(step.to), reason: step.reason },
    })),
  );
  await publishCoreEvents(
    tx,
    caller,
    moves.map((step) => ({
      type: step.event === 'converted' ? 'core.lead.converted' : 'core.lead.stage_changed',
      subject: { type: recordType, id: recordId },
      payload: { event: step.event, from: stageRef(step.from), to: stageRef(step.to), reason: step.reason },
    })),
  );
};

// ─── Bulk moves, conversion, history ─────────────────────────────────────────

/** Leads among `ids` (others are refused). */
const leadIds = async (client: Db, orgId: string, type: LeadRecordType, ids: string[]) => {
  const table = recordTable(type);
  const rows = await client
    .select({ id: table.id, state: table.state })
    .from(table)
    .where(and(eq(table.orgId, orgId), inArray(table.id, ids)));

  if (rows.length !== new Set(ids).size) throw notFound('Lead');
  if (rows.some((row) => row.state !== 'lead')) throw new HttpError(400, 'NOT_A_LEAD', 'Some of these are customers already');

  return rows.map((row) => row.id);
};

/** The update function of a record type (loaded late: those services use this one). */
const updaterOf = async (type: LeadRecordType) =>
  type === 'company'
    ? (await import('~/modules/companies/companies.service')).updateCompany
    : (await import('~/modules/customers/customers.service')).updateCustomer;

export const moveLeads = async (
  client: Db,
  actor: Actor,
  input: { recordType?: LeadRecordType; ids: string[]; stageId: string; reason?: string },
) => {
  const type = input.recordType ?? 'customer';
  const update = await updaterOf(type);

  return client.transaction(async (tx) => {
    const stage = await findStage(tx, actor.orgId, input.stageId);
    let moved = 0;

    for (const id of await leadIds(tx, actor.orgId, type, input.ids)) {
      await update(tx, actor, id, { leadStageId: stage.id, ...(input.reason ? { disqualifyReason: input.reason } : {}) });
      moved += 1;
    }

    return { moved };
  });
};

export const convertLeads = async (
  client: Db,
  actor: Actor,
  input: { recordType?: LeadRecordType; ids: string[]; ownerId?: string; companyId?: string },
) => {
  const type = input.recordType ?? 'customer';

  if (type === 'company' && input.companyId) throw new HttpError(400, 'INVALID_INPUT', 'Companies are not linked to a company');

  const update = await updaterOf(type);
  const { linkCustomerCompany } = await import('~/modules/customers/customers.service');

  return client.transaction(async (tx) => {
    let converted = 0;

    for (const id of await leadIds(tx, actor.orgId, type, input.ids)) {
      await update(tx, actor, id, { state: 'customer', ...(input.ownerId ? { ownerId: input.ownerId } : {}) });
      if (input.companyId) await linkCustomerCompany(tx, actor, id, input.companyId);
      converted += 1;
    }

    return { converted };
  });
};

export const leadHistory = async (client: Db, actor: Actor, input: { recordType?: LeadRecordType; id: string }) => {
  const type = input.recordType ?? 'customer';
  const rows = await client
    .select()
    .from(leadEvents)
    .where(and(eq(leadEvents.orgId, actor.orgId), eq(type === 'company' ? leadEvents.companyId : leadEvents.customerId, input.id)))
    .orderBy(asc(leadEvents.createdAt));

  return {
    data: rows.map((row) => ({
      id: row.id,
      recordType: type,
      recordId: input.id,
      event: row.event,
      fromStageId: row.fromStageId,
      toStageId: row.toStageId,
      reason: row.reason,
      actorType: row.actorType,
      actorId: row.actorId,
      createdAt: row.createdAt.toISOString(),
    })),
  };
};

// ─── Report ──────────────────────────────────────────────────────────────────

const rowsOf = async <T extends Record<string, unknown>>(client: Db, query: ReturnType<typeof sql>) => (await client.execute<T>(query)).rows;

const days = (value: unknown) => (value === null || value === undefined ? null : Math.round(Number(value) * 10) / 10);

/**
 * The funnel for a period: leads made, converted and lost; the period's leads
 * by source and owner (cohort: what became of them); every stage with who is
 * in it now, who reached it and the average stay; why leads were lost.
 */
export const leadReport = async (client: Db, actor: Actor, input: { recordType?: LeadRecordType; from?: string; to?: string }): Promise<LeadReport> => {
  const type = input.recordType ?? 'customer';
  const table = recordTable(type);
  const col = sql.raw(type === 'company' ? 'company_id' : 'customer_id');
  const to = input.to ? new Date(input.to) : new Date();
  const from = input.from ? new Date(input.from) : new Date(to.getTime() - 30 * 86_400_000);

  if (from >= to) throw new HttpError(400, 'INVALID_INPUT', '`from` must be before `to`');

  const orgId = actor.orgId;
  const inPeriod = sql`e.created_at >= ${from.toISOString()}::timestamptz and e.created_at < ${to.toISOString()}::timestamptz`;
  const stages = await stagesOf(client, orgId);
  const counts = await leadCounts(client, orgId, type);

  const [totals] = await rowsOf<{ created: number; converted: number; disqualified: number; cohort_converted: number; median: number | null; average: number | null }>(
    client,
    sql`
      with period as (select e.* from ${leadEvents} e where e.org_id = ${orgId} and e.${col} is not null and ${inPeriod}),
      cohort as (select c.converted_at from period e join ${table} c on c.id = e.${col} where e.event = 'created'),
      conversions as (
        select extract(epoch from (e.created_at - coalesce(
          (select min(x.created_at) from ${leadEvents} x where x.${col} = e.${col} and x.event in ('created', 'reopened') and x.created_at <= e.created_at),
          e.created_at))) / 86400 as days
        from period e where e.event = 'converted'
      )
      select
        (select count(*) from cohort)::int as created,
        (select count(*) from period where event = 'converted')::int as converted,
        (select count(distinct e.${col}) from period e join ${leadStages} s on s.id = e.to_stage_id where s.kind = 'disqualified' and e.event in ('stage', 'created', 'reopened'))::int as disqualified,
        (select count(*) from cohort where converted_at is not null)::int as cohort_converted,
        (select percentile_cont(0.5) within group (order by days) from conversions) as median,
        (select avg(days) from conversions) as average
    `,
  );

  // Each stint in a stage: from the event that put the lead there to the next one (or now, while still there).
  const stageRows = await rowsOf<{ stage_id: string; reached: number; average_days: number | null }>(
    client,
    sql`
      with stints as (
        select e.${col} as record_id, e.to_stage_id, e.created_at,
          lead(e.created_at) over (partition by e.${col} order by e.created_at, e.id) as left_at
        from ${leadEvents} e where e.org_id = ${orgId} and e.${col} is not null and e.to_stage_id is not null
      )
      select to_stage_id as stage_id,
        count(distinct record_id) filter (where created_at >= ${from.toISOString()}::timestamptz and created_at < ${to.toISOString()}::timestamptz)::int as reached,
        avg(extract(epoch from (left_at - created_at)) / 86400) filter (where left_at >= ${from.toISOString()}::timestamptz and left_at < ${to.toISOString()}::timestamptz) as average_days
      from stints group by to_stage_id
    `,
  );
  const byStage = new Map(stageRows.map((row) => [row.stage_id, row]));

  const cohort = (column: 'source' | 'owner_id') =>
    rowsOf<{ key: string | null; count: number; converted: number }>(
      client,
      sql`
        select c.${sql.raw(column)} as key, count(*)::int as count, count(c.converted_at)::int as converted
        from ${leadEvents} e join ${table} c on c.id = e.${col}
        where e.org_id = ${orgId} and e.event = 'created' and e.${col} is not null and ${inPeriod}
        group by 1 order by 2 desc limit 20
      `,
    );
  const [sources, owners, reasons] = await Promise.all([
    cohort('source'),
    cohort('owner_id'),
    rowsOf<{ reason: string; count: number }>(
      client,
      sql`
        select e.reason, count(*)::int as count
        from ${leadEvents} e join ${leadStages} s on s.id = e.to_stage_id
        where e.org_id = ${orgId} and e.${col} is not null and s.kind = 'disqualified' and e.reason is not null and ${inPeriod}
        group by 1 order by 2 desc limit 10
      `,
    ),
  ]);

  const created = Number(totals?.created ?? 0);

  return {
    recordType: type,
    from: from.toISOString(),
    to: to.toISOString(),
    created,
    converted: Number(totals?.converted ?? 0),
    disqualified: Number(totals?.disqualified ?? 0),
    conversionRate: created ? Number(totals?.cohort_converted ?? 0) / created : 0,
    daysToConvert: { median: days(totals?.median), average: days(totals?.average) },
    stages: stages.map((stage) => ({
      stageId: stage.id,
      name: stage.name,
      kind: stage.kind,
      color: stage.color,
      current: counts.get(stage.id) ?? 0,
      reached: Number(byStage.get(stage.id)?.reached ?? 0),
      averageDays: days(byStage.get(stage.id)?.average_days),
    })),
    bySource: sources.map((row) => ({ source: row.key, count: Number(row.count), converted: Number(row.converted) })),
    byOwner: owners.map((row) => ({ ownerId: row.key, count: Number(row.count), converted: Number(row.converted) })),
    reasons: reasons.map((row) => ({ reason: row.reason, count: Number(row.count) })),
  };
};
