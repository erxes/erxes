import type { LeadStageKind } from '@erxes/core-contract';
import { companies, customers, type Db, leadStages, newId } from '@erxes/core-db';
import { and, eq, max, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { setOrders } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { findStage, leadCounts, type StageRow, stagesOf } from './stages';

/**
 * Lead stages: where people who are not customers yet stand (New → Contacted →
 * Engaged → Qualified, or Disqualified) until they are converted.
 */
const DEFAULT_LEAD_STAGES: { name: string; kind: LeadStageKind; color: string }[] = [
  { name: 'New', kind: 'open', color: '#3b82f6' },
  { name: 'Contacted', kind: 'open', color: '#8b5cf6' },
  { name: 'Engaged', kind: 'open', color: '#f59e0b' },
  { name: 'Qualified', kind: 'qualified', color: '#10b981' },
  { name: 'Disqualified', kind: 'disqualified', color: '#94a3b8' },
];

/** A new organisation's stages. */
export const seedLeadStages = async (tx: Db, orgId: string) => {
  await tx
    .insert(leadStages)
    .values(DEFAULT_LEAD_STAGES.map((stage, order) => ({ id: newId(), orgId, order, ...stage })));
};

type Counts = Map<string | null, number>;

const toStageDto = (
  stage: Pick<StageRow, 'id' | 'name' | 'kind' | 'color' | 'order'>,
  people: Counts = new Map(),
  companyLeads: Counts = new Map(),
) => ({
  id: stage.id,
  name: stage.name,
  kind: stage.kind,
  color: stage.color,
  order: stage.order,
  leadCount: people.get(stage.id) ?? 0,
  companyLeadCount: companyLeads.get(stage.id) ?? 0,
});

/** Leads per stage, people and companies (one after another: `client` may be a transaction). */
const countsOf = async (client: Db, orgId: string) =>
  [
    await leadCounts(client, orgId, 'customer'),
    await leadCounts(client, orgId, 'company'),
  ] as const;

export const listLeadStages = async (client: Db, actor: Actor) => {
  const stages = await wholeList((limit) => stagesOf(client, actor.orgId).limit(limit));
  const counts = await countsOf(client, actor.orgId);

  return { data: stages.map((stage) => toStageDto(stage, ...counts)) };
};

const stageTaken = (error: unknown): never => {
  if (pgCode(error) === '23505')
    throw new HttpError(409, 'LEAD_STAGE_EXISTS', 'A stage with this name already exists');

  throw error;
};

const audit = (tx: Db, actor: Actor, action: string, stage: Pick<StageRow, 'id' | 'name'>) =>
  recordAudit(tx, userCaller(actor), {
    action,
    targetType: 'lead_stage',
    targetId: stage.id,
    targetLabel: stage.name,
  });

export const createLeadStage = async (
  client: Db,
  actor: Actor,
  input: { name: string; kind?: LeadStageKind; color?: string },
) =>
  client
    .transaction(async (tx) => {
      const [last] = await tx
        .select({ order: max(leadStages.order) })
        .from(leadStages)
        .where(eq(leadStages.orgId, actor.orgId));

      const stage = {
        id: newId(),
        orgId: actor.orgId,
        name: input.name,
        kind: input.kind ?? 'open',
        color: input.color ?? '#64748b',
        order: (last?.order ?? -1) + 1,
      };

      await tx.insert(leadStages).values(stage);
      await audit(tx, actor, 'lead_stage.created', stage);

      return toStageDto(stage);
    })
    .catch(stageTaken);

/** Some stage of each kind a lead can be moved to must stay: at least one open one. */
const assertOpenStageLeft = (stages: StageRow[], without: (stage: StageRow) => boolean) => {
  if (!stages.some((stage) => stage.kind === 'open' && !without(stage))) {
    throw new HttpError(
      409,
      'LAST_OPEN_STAGE',
      'Keep at least one open stage: new leads start there',
    );
  }
};

export const updateLeadStage = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { name?: string; kind?: LeadStageKind; color?: string },
) =>
  client
    .transaction(async (tx) => {
      const stages = await stagesOf(tx, actor.orgId);

      if (!stages.some((stage) => stage.id === id)) throw notFound('Lead stage');

      if (input.kind && input.kind !== 'open')
        assertOpenStageLeft(stages, (stage) => stage.id === id);

      const [stage] = await tx
        .update(leadStages)
        .set({ ...input, updatedAt: sql`now()` })
        .where(and(eq(leadStages.orgId, actor.orgId), eq(leadStages.id, id)))
        .returning();

      if (!stage) throw notFound('Lead stage');

      await audit(tx, actor, 'lead_stage.updated', stage);

      return toStageDto(stage, ...(await countsOf(tx, actor.orgId)));
    })
    .catch(stageTaken);

export const reorderLeadStages = async (client: Db, actor: Actor, ids: string[]) =>
  client.transaction(async (tx) => {
    const stages = await stagesOf(tx, actor.orgId);

    if (
      ids.length !== stages.length ||
      new Set(ids).size !== ids.length ||
      stages.some((stage) => !ids.includes(stage.id))
    ) {
      throw new HttpError(400, 'INVALID_INPUT', 'List every stage exactly once');
    }

    return setOrders(
      tx,
      actor.orgId,
      leadStages,
      ids.map((id, order) => ({ id, order })),
    );
  });

const inStage = (table: typeof customers | typeof companies, orgId: string, stageId: string) =>
  and(eq(table.orgId, orgId), eq(table.leadStageId, stageId));

/** Everyone in a stage (leads, and customers who converted from it). */
const peopleIn = async (tx: Db, orgId: string, stageId: string) => {
  const [row] = await tx
    .execute<{ count: number }>(sql`
    select (select count(*) from ${customers} where ${inStage(customers, orgId, stageId)})::int
      + (select count(*) from ${companies} where ${inStage(companies, orgId, stageId)})::int as count
  `)
    .then((result) => result.rows);

  return row?.count ?? 0;
};

/** Moves everyone in stage `from` to `to` (a stage of the organisation): people, then companies. */
const moveEveryone = async (tx: Db, orgId: string, from: string, to: string) => {
  await findStage(tx, orgId, to);

  const moved = { leadStageId: to, leadStageChangedAt: sql`now()` };

  await tx
    .update(customers)
    .set(moved)
    .where(inStage(customers, orgId, from));
  await tx
    .update(companies)
    .set(moved)
    .where(inStage(companies, orgId, from));
};

/** Deletes a stage; everyone in it (leads, and customers who converted from it) moves to `moveTo`. */
export const removeLeadStage = async (
  client: Db,
  actor: Actor,
  id: string,
  moveTo: string | undefined,
) =>
  client.transaction(async (tx) => {
    const stages = await stagesOf(tx, actor.orgId);
    const stage = stages.find((item) => item.id === id);

    if (!stage) throw notFound('Lead stage');
    assertOpenStageLeft(stages, (item) => item.id === id);

    const count = await peopleIn(tx, actor.orgId, id);

    if (count) {
      if (!moveTo || moveTo === id)
        throw new HttpError(
          409,
          'LEAD_STAGE_IN_USE',
          `${count} leads are in this stage: choose where they move`,
          { count },
        );

      await moveEveryone(tx, actor.orgId, id, moveTo);
    }

    await tx
      .delete(leadStages)
      .where(and(eq(leadStages.orgId, actor.orgId), eq(leadStages.id, id)));
    await audit(tx, actor, 'lead_stage.deleted', stage);

    return { moved: count };
  });
