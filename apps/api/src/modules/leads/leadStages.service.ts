import type { LeadStageKind } from '@erxes/core-contract';
import { companies, customers, type Db, leadStages, newId } from '@erxes/core-db';
import { and, asc, eq, getTableColumns, max, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { fail, notFound } from '~/http/errors';
import { oneRow, setOrders } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { findStage, type StageRow, stagesOf } from './stages';

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

/** How many leads of a type stand in the stage now. */
const leadsIn = (client: Db, table: typeof customers | typeof companies) =>
  client.$count(table, and(eq(table.leadStageId, leadStages.id), eq(table.state, 'lead')));

/** Stages in order, with their people and company leads counted. */
const stagesWithCounts = (client: Db) =>
  client
    .select({
      ...getTableColumns(leadStages),
      leadCount: leadsIn(client, customers),
      companyLeadCount: leadsIn(client, companies),
    })
    .from(leadStages)
    .orderBy(asc(leadStages.order), asc(leadStages.createdAt));

const stageWithCounts = async (client: Db, id: string) =>
  oneRow(await stagesWithCounts(client).where(eq(leadStages.id, id)).limit(1));

export const listLeadStages = async (client: Db) => ({
  data: await wholeList((limit) => stagesWithCounts(client).limit(limit)),
});

const audit = (tx: Db, action: string, stage: Pick<StageRow, 'id' | 'name'>) =>
  recordAudit(tx, {
    action,
    targetType: 'lead_stage',
    targetId: stage.id,
    targetLabel: stage.name,
  });

export const createLeadStage = async (
  client: Db,
  input: { name: string; kind?: LeadStageKind; color?: string },
) => {
  const [last] = await client.select({ order: max(leadStages.order) }).from(leadStages);

  const stage = {
    id: newId(),
    name: input.name,
    kind: input.kind ?? 'open',
    color: input.color ?? '#64748b',
    order: (last?.order ?? -1) + 1,
  };

  await client.insert(leadStages).values(stage);
  await audit(client, 'lead_stage.created', stage);

  return stageWithCounts(client, stage.id);
};

/** Some stage of each kind a lead can be moved to must stay: at least one open one. */
const assertOpenStageLeft = (stages: StageRow[], without: (stage: StageRow) => boolean) => {
  if (!stages.some((stage) => stage.kind === 'open' && !without(stage))) {
    throw fail('LAST_OPEN_STAGE', 'Keep at least one open stage: new leads start there');
  }
};

export const updateLeadStage = async (
  client: Db,
  id: string,
  input: { name?: string; kind?: LeadStageKind; color?: string },
) => {
  const stages = await stagesOf(client);

  if (!stages.some((stage) => stage.id === id)) throw notFound('Lead stage');

  if (input.kind && input.kind !== 'open') assertOpenStageLeft(stages, (stage) => stage.id === id);

  const [stage] = await client
    .update(leadStages)
    .set({ ...input, updatedAt: sql`now()` })
    .where(eq(leadStages.id, id))
    .returning();

  if (!stage) throw notFound('Lead stage');

  await audit(client, 'lead_stage.updated', stage);

  return stageWithCounts(client, stage.id);
};

export const reorderLeadStages = async (client: Db, ids: string[]) => {
  const stages = await stagesOf(client);

  if (
    ids.length !== stages.length ||
    new Set(ids).size !== ids.length ||
    stages.some((stage) => !ids.includes(stage.id))
  ) {
    throw fail('INVALID_INPUT', 'List every stage exactly once', {
      issues: [{ path: ['ids'], message: 'List every stage exactly once' }],
    });
  }

  return setOrders(
    client,
    leadStages,
    ids.map((id, order) => ({ id, order })),
  );
};

const inStage = (table: typeof customers | typeof companies, stageId: string) =>
  eq(table.leadStageId, stageId);

/** Everyone in a stage (leads, and customers who converted from it). */
const peopleIn = async (tx: Db, stageId: string) => {
  const [row] = await tx
    .execute<{ count: number }>(sql`
    select (select count(*) from ${customers} where ${inStage(customers, stageId)})::int
      + (select count(*) from ${companies} where ${inStage(companies, stageId)})::int as count
  `)
    .then((result) => result.rows);

  return row?.count ?? 0;
};

/** Moves everyone in stage `from` to `to` (a stage of the organisation): people, then companies. */
const moveEveryone = async (tx: Db, from: string, to: string) => {
  await findStage(tx, to);

  const moved = { leadStageId: to, leadStageChangedAt: sql`now()` };

  await tx.update(customers).set(moved).where(inStage(customers, from));
  await tx.update(companies).set(moved).where(inStage(companies, from));
};

/** Deletes a stage; everyone in it (leads, and customers who converted from it) moves to `moveTo`. */
export const removeLeadStage = async (client: Db, id: string, moveTo: string | undefined) => {
  const stages = await stagesOf(client);
  const stage = stages.find((item) => item.id === id);

  if (!stage) throw notFound('Lead stage');
  assertOpenStageLeft(stages, (item) => item.id === id);

  const count = await peopleIn(client, id);

  if (count) {
    if (!moveTo || moveTo === id)
      throw fail('LEAD_STAGE_IN_USE', `${count} leads are in this stage: choose where they move`, {
        count,
      });

    await moveEveryone(client, id, moveTo);
  }

  await client.delete(leadStages).where(eq(leadStages.id, id));
  await audit(client, 'lead_stage.deleted', stage);

  return { moved: count };
};
