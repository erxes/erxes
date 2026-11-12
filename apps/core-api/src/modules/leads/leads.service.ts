import type { LeadRecordType } from '@erxes/core-contract';
import { type Db, leadEvents } from '@erxes/core-db';
import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Actor } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { findStage, recordTable } from './stages';

/**
 * Leads in bulk: moving them between stages, converting them, and one lead's
 * history. Stages are in `leadStages.service`, the lifecycle the customer and
 * company services plan in `lifecycle`, the funnel in `report`.
 */

/** Leads among `ids` (others are refused). */
const leadIds = async (client: Db, orgId: string, type: LeadRecordType, ids: string[]) => {
  const table = recordTable(type);

  const rows = await client
    .select({ id: table.id, state: table.state })
    .from(table)
    .where(and(eq(table.orgId, orgId), inArray(table.id, ids)));

  if (rows.length !== new Set(ids).size) throw notFound('Lead');

  if (rows.some((row) => row.state !== 'lead'))
    throw new HttpError(400, 'NOT_A_LEAD', 'Some of these are customers already');

  return rows.map((row) => row.id);
};

/** The update function of a record type (loaded late: those services use this module). */
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
      await update(tx, actor, id, {
        leadStageId: stage.id,
        ...(input.reason ? { disqualifyReason: input.reason } : {}),
      });
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

  if (type === 'company' && input.companyId)
    throw new HttpError(400, 'INVALID_INPUT', 'Companies are not linked to a company');

  const update = await updaterOf(type);
  const { linkCustomerCompany } = await import('~/modules/customers/customers.service');

  return client.transaction(async (tx) => {
    let converted = 0;

    for (const id of await leadIds(tx, actor.orgId, type, input.ids)) {
      await update(tx, actor, id, {
        state: 'customer',
        ...(input.ownerId ? { ownerId: input.ownerId } : {}),
      });

      if (input.companyId) await linkCustomerCompany(tx, actor, id, input.companyId);
      converted += 1;
    }

    return { converted };
  });
};

export const leadHistory = async (
  client: Db,
  actor: Actor,
  input: { recordType?: LeadRecordType; id: string },
) => {
  const type = input.recordType ?? 'customer';

  const rows = await client
    .select()
    .from(leadEvents)
    .where(
      and(
        eq(leadEvents.orgId, actor.orgId),
        eq(type === 'company' ? leadEvents.companyId : leadEvents.customerId, input.id),
      ),
    )
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
