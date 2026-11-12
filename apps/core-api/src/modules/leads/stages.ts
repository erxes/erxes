import type { LeadRecordType, LeadStageKind } from '@erxes/core-contract';
import { companies, customers, type Db, leadStages } from '@erxes/core-db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { HttpError } from '~/http/errors';

export type StageRow = typeof leadStages.$inferSelect;

/** People and companies carry the same lifecycle columns. */
export const recordTable = (type: LeadRecordType) => (type === 'company' ? companies : customers);

/** An organisation's stages, in order. */
export const stagesOf = (client: Db, orgId: string) =>
  client
    .select()
    .from(leadStages)
    .where(eq(leadStages.orgId, orgId))
    .orderBy(asc(leadStages.order), asc(leadStages.createdAt));

/** A stage of the organisation, or 400 INVALID_LEAD_STAGE. */
export const findStage = async (client: Db, orgId: string, id: string) => {
  const [stage] = await client
    .select()
    .from(leadStages)
    .where(and(eq(leadStages.orgId, orgId), eq(leadStages.id, id)))
    .limit(1);

  if (!stage)
    throw new HttpError(400, 'INVALID_LEAD_STAGE', 'Not a lead stage of this organisation', {
      stageId: id,
    });

  return stage;
};

/** The first stage of a kind (in order), if any. */
export const firstStage = async (client: Db, orgId: string, kind: LeadStageKind) =>
  (await stagesOf(client, orgId)).find((stage) => stage.kind === kind) ?? null;

/** How many leads of a type are in each stage now. */
export const leadCounts = async (client: Db, orgId: string, type: LeadRecordType) => {
  const table = recordTable(type);

  const rows = await client
    .select({ stageId: table.leadStageId, count: sql<number>`count(*)::int` })
    .from(table)
    .where(and(eq(table.orgId, orgId), eq(table.state, 'lead')))
    .groupBy(table.leadStageId);

  return new Map(rows.map((row) => [row.stageId, row.count]));
};
