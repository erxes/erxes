import type { Automation, AutomationDefinition } from '@erxes/core-contract';
import { FINISHED_RUN_STATUSES } from '@erxes/core-db/enums';
import {
  automationRuns,
  automations,
  automationVersions,
  caller,
  type Db,
  newId,
} from '@erxes/core-db';
import { and, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { notFound } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { checkDefinition } from './definitions';
import { firstRunAt, triggerKey } from './triggers';

type AutomationRow = typeof automations.$inferSelect;

const status = automationRuns.status;

/** Automations with how many of their runs are going, succeeded and failed (one pass over the runs). */
const selectAutomations = (client: Db) => {
  const stats = client
    .select({
      stats: sql`json_build_object(
        'running', count(*) filter (where ${status} not in ${FINISHED_RUN_STATUSES}),
        'succeeded', count(*) filter (where ${status} = 'succeeded'),
        'failed', count(*) filter (where ${status} = 'failed'))`,
    })
    .from(automationRuns)
    .where(eq(automationRuns.automationId, automations.id));

  return client
    .select({ ...getTableColumns(automations), stats: sql<Automation['stats']>`(${stats})` })
    .from(automations);
};

export const findAutomation = async (client: Db, id: string) => {
  const [row] = await client.select().from(automations).where(eq(automations.id, id)).limit(1);

  if (!row) throw notFound('Automation');

  return row;
};

const publish = async (client: Db, row: AutomationRow, definition: AutomationDefinition) => {
  const version = (row.activeVersion ?? 0) + 1;

  await client.insert(automationVersions).values({
    automationId: row.id,
    version,
    definition,
    publishedBy: caller('user').userId,
  });

  return version;
};

export const listAutomations = async (client: Db, query: { status?: AutomationRow['status'] }) => {
  const rows = await wholeList((limit) =>
    selectAutomations(client)
      .where(query.status ? eq(automations.status, query.status) : undefined)
      .orderBy(desc(automations.updatedAt))
      .limit(limit),
  );

  return { data: rows };
};

export const getAutomation = async (client: Db, id: string) => {
  const [row] = await selectAutomations(client).where(eq(automations.id, id)).limit(1);

  if (!row) throw notFound('Automation');

  return row;
};

export const createAutomation = async (
  client: Db,
  input: { name: string; description?: string | null; definition: AutomationDefinition },
) => {
  const values = {
    id: newId(),
    name: input.name,
    description: input.description ?? null,
    definition: input.definition,
    triggerEvent: triggerKey(input.definition),
    createdBy: caller('user').userId,
  };

  await client.insert(automations).values(values);
  await recordAudit(client, {
    action: 'automation.created',
    targetType: 'automation',
    targetId: values.id,
    targetLabel: values.name,
  });

  return getAutomation(client, values.id);
};

export const updateAutomation = async (
  client: Db,
  id: string,
  input: { name?: string; description?: string | null; definition?: AutomationDefinition },
) => {
  const before = await findAutomation(client, id);
  // An active automation publishes the change at once (checked first); runs in progress keep their version.
  const published = input.definition && before.status === 'active' ? input.definition : null;

  if (published) await checkDefinition(client, published);

  const activeVersion = published ? await publish(client, before, published) : before.activeVersion;

  await client
    .update(automations)
    .set({
      name: input.name,
      description: input.description,
      definition: input.definition,
      triggerEvent: input.definition && triggerKey(input.definition),
      activeVersion,
      ...(published
        ? { activatedBy: caller('user').userId, nextRunAt: firstRunAt(published) }
        : {}),
      updatedAt: sql`now()`,
    })
    .where(eq(automations.id, id));
  await recordAudit(client, {
    action: 'automation.updated',
    targetType: 'automation',
    targetId: id,
    targetLabel: input.name ?? before.name,
    metadata: published ? { publishedVersion: activeVersion } : undefined,
  });

  return getAutomation(client, id);
};

/** Checks the definition, publishes it as a new version and turns the automation on, acting as this member. */
export const activateAutomation = async (client: Db, id: string) => {
  const row = await findAutomation(client, id);
  const { definition } = row;

  await checkDefinition(client, definition);

  const version = await publish(client, row, definition);

  await client
    .update(automations)
    .set({
      status: 'active',
      activeVersion: version,
      activatedBy: caller('user').userId,
      nextRunAt: firstRunAt(definition),
      updatedAt: sql`now()`,
    })
    .where(eq(automations.id, id));
  await recordAudit(client, {
    action: 'automation.activated',
    targetType: 'automation',
    targetId: id,
    targetLabel: row.name,
    metadata: { version },
  });

  return getAutomation(client, id);
};

/** No new runs start; runs in progress finish. */
export const pauseAutomation = async (client: Db, id: string) => {
  const row = await findAutomation(client, id);

  await client
    .update(automations)
    .set({ status: 'paused', nextRunAt: null, updatedAt: sql`now()` })
    .where(eq(automations.id, id));
  await recordAudit(client, {
    action: 'automation.paused',
    targetType: 'automation',
    targetId: id,
    targetLabel: row.name,
  });

  return getAutomation(client, id);
};

export const removeAutomation = async (client: Db, id: string) => {
  const row = await findAutomation(client, id);

  await client.delete(automations).where(eq(automations.id, id));
  await recordAudit(client, {
    action: 'automation.deleted',
    targetType: 'automation',
    targetId: id,
    targetLabel: row.name,
  });

  return { ok: true as const };
};

export const listVersions = async (client: Db, id: string) => {
  await findAutomation(client, id);

  const rows = await client
    .select()
    .from(automationVersions)
    .where(eq(automationVersions.automationId, id))
    .orderBy(desc(automationVersions.version))
    .limit(100);

  return { data: rows };
};

/** An older version becomes the working copy; an active automation publishes it at once. */
export const restoreVersion = async (client: Db, id: string, version: number) => {
  const [row] = await client
    .select()
    .from(automationVersions)
    .where(and(eq(automationVersions.automationId, id), eq(automationVersions.version, version)))
    .limit(1);

  if (!row) throw notFound('Version');

  return updateAutomation(client, id, { definition: row.definition });
};
