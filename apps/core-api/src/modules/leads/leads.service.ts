import type { LeadRecordType } from '@erxes/core-contract';
import { companies, customers, type Db, leadEvents } from '@erxes/core-db';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { assertOwner } from '~/lib/guards';
import { lockRows } from '~/lib/locks';
import { inOrder } from '~/lib/sequence';
import { contactsUpdated } from '~/modules/activities/contactHistory';
import { selectCompanies } from '~/modules/companies/companyRows';
import { selectCustomers } from '~/modules/customers/customerRows';
import { linkCustomersToCompany } from '~/modules/customers/customers.service';
import { type LeadPlan, planLeadChange, recordLeadSteps } from './lifecycle';
import { findStage, stagesOf } from './stages';

/**
 * Leads in bulk: moving them between stages, converting them, and one lead's
 * history. Stages are in `leadStages.service`, the lifecycle the customer and
 * company services plan in `lifecycle`, the funnel in `report`.
 */

/** The leads among `ids`, locked and read in one query each (others are refused). */
const lockLeads = async (tx: Db, type: LeadRecordType, ids: string[]) => {
  await lockRows(tx, type === 'company' ? 'core_companies' : 'core_customers', ids);

  const rows =
    type === 'company'
      ? await selectCompanies(tx).where(inArray(companies.id, ids))
      : await selectCustomers(tx).where(inArray(customers.id, ids));

  if (rows.length !== new Set(ids).size) throw notFound('Lead');

  if (rows.some((row) => row.state !== 'lead'))
    throw new HttpError(400, 'NOT_A_LEAD', 'Some of these are customers already');

  return rows;
};

type LeadRow = Awaited<ReturnType<typeof lockLeads>>[number];

const updateLeads = (tx: Db, type: LeadRecordType, ids: string[], set: LeadPlan['set']) =>
  type === 'company'
    ? tx
        .update(companies)
        .set({ ...set, updatedAt: sql`now()` })
        .where(inArray(companies.id, ids))
    : tx
        .update(customers)
        .set({ ...set, updatedAt: sql`now()` })
        .where(inArray(customers.id, ids));

/**
 * Writes each lead's plan plus `extra` (columns every lead gets), one update
 * per distinct change (a lead keeping its stage doesn't write it), then the
 * history of all of them: lead steps, and the timeline, events, audit
 * entries and notifications of the fields that changed.
 */
const writePlans = async (
  tx: Db,
  actor: Actor,
  type: LeadRecordType,
  planned: { row: LeadRow; plan: LeadPlan }[],
  extra: LeadPlan['set'],
) => {
  const groups = new Map<string, { set: LeadPlan['set']; ids: string[] }>();

  for (const { row, plan } of planned) {
    const { leadStageId, ...rest } = plan.set;
    const set = { ...(leadStageId === row.leadStageId ? rest : plan.set), ...extra };
    const key = JSON.stringify(set);
    const group = groups.get(key) ?? { set, ids: [] };

    group.ids.push(row.id);
    groups.set(key, group);
  }

  // At most a few updates (one per outcome), one after another on the transaction.
  await inOrder(groups.values(), ({ set, ids }) => updateLeads(tx, type, ids, set));
  await recordLeadSteps(
    tx,
    userCaller(actor),
    type,
    planned.map(({ row, plan }) => ({ id: row.id, steps: plan.steps })),
  );
  await contactsUpdated(
    tx,
    actor,
    type,
    planned.map(({ row, plan }) => ({ before: row, after: { ...row, ...plan.set, ...extra } })),
  );
};

export const moveLeads = async (
  client: Db,
  actor: Actor,
  input: { recordType?: LeadRecordType; ids: string[]; stageId: string; reason?: string },
) => {
  const type = input.recordType ?? 'customer';

  const stage = await findStage(client, input.stageId);
  const rows = await lockLeads(client, type, input.ids);
  const stages = await stagesOf(client);
  const now = new Date();

  const leadInput = {
    leadStageId: stage.id,
    ...(input.reason ? { disqualifyReason: input.reason } : {}),
  };

  const planned = rows.map((row) => ({
    row,
    plan: planLeadChange({
      caller: userCaller(actor),
      stages,
      current: row,
      input: leadInput,
      asked: stage,
      now,
    }),
  }));

  await writePlans(client, actor, type, planned, {});

  return { moved: rows.length };
};

export const convertLeads = async (
  client: Db,
  actor: Actor,
  input: { recordType?: LeadRecordType; ids: string[]; ownerId?: string; companyId?: string },
) => {
  const type = input.recordType ?? 'customer';

  if (type === 'company' && input.companyId)
    throw new HttpError(400, 'INVALID_INPUT', 'Companies are not linked to a company');

  const rows = await lockLeads(client, type, input.ids);

  await assertOwner(client, input.ownerId);

  const stages = await stagesOf(client);
  const now = new Date();

  const planned = rows.map((row) => ({
    row,
    plan: planLeadChange({
      caller: userCaller(actor),
      stages,
      current: row,
      input: { state: 'customer' },
      asked: null,
      now,
    }),
  }));

  await writePlans(client, actor, type, planned, {
    state: 'customer',
    ...(input.ownerId ? { ownerId: input.ownerId } : {}),
  });

  if (input.companyId)
    await linkCustomersToCompany(
      client,
      actor,
      rows.map((row) => row.id),
      input.companyId,
    );

  return { converted: rows.length };
};

export const leadHistory = async (
  client: Db,
  input: { recordType?: LeadRecordType; id: string },
) => {
  const type = input.recordType ?? 'customer';

  // The last 200 steps, oldest of them first.
  const rows = (
    await client
      .select()
      .from(leadEvents)
      .where(eq(type === 'company' ? leadEvents.companyId : leadEvents.customerId, input.id))
      .orderBy(desc(leadEvents.createdAt), desc(leadEvents.id))
      .limit(200)
  ).toReversed();

  return {
    data: rows.map((row) => ({ ...row, recordType: type, recordId: input.id })),
  };
};
