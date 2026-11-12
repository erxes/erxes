import { type Automation, AutomationDefinition } from '@erxes/core-contract';
import { automationRuns, automations, automationVersions, type Db, newId } from '@erxes/core-db';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { type Actor, userCaller } from '~/http/auth';
import { notFound } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { checkDefinition } from './definitions';
import { firstRunAt, triggerKey } from './triggers';

type AutomationRow = typeof automations.$inferSelect;

type Stats = Automation['stats'];

const noRuns = (): Stats => ({ running: 0, succeeded: 0, failed: 0 });

const statsOf = async (client: Db, orgId: string, ids: string[]) => {
  const stats = new Map<string, Stats>();

  if (!ids.length) return stats;

  const rows = await client
    .select({
      automationId: automationRuns.automationId,
      status: automationRuns.status,
      count: sql<number>`count(*)::int`,
    })
    .from(automationRuns)
    .where(and(eq(automationRuns.orgId, orgId), inArray(automationRuns.automationId, ids)))
    .groupBy(automationRuns.automationId, automationRuns.status);

  for (const row of rows) {
    const entry = stats.get(row.automationId) ?? noRuns();

    if (row.status === 'running' || row.status === 'waiting') entry.running += row.count;

    if (row.status === 'succeeded') entry.succeeded += row.count;

    if (row.status === 'failed') entry.failed += row.count;
    stats.set(row.automationId, entry);
  }

  return stats;
};

const toAutomationDto = (row: AutomationRow, stats = noRuns()): Automation => ({
  id: row.id,
  name: row.name,
  description: row.description,
  status: row.status,
  definition: AutomationDefinition.parse(row.definition),
  activeVersion: row.activeVersion,
  activatedBy: row.activatedBy,
  stats,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const findAutomation = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(automations)
    .where(and(eq(automations.orgId, orgId), eq(automations.id, id)))
    .limit(1);

  if (!row) throw notFound('Automation');

  return row;
};

const publish = async (
  client: Db,
  actor: Actor,
  row: AutomationRow,
  definition: AutomationDefinition,
) => {
  const version = (row.activeVersion ?? 0) + 1;

  await client.insert(automationVersions).values({
    orgId: actor.orgId,
    automationId: row.id,
    version,
    definition,
    publishedBy: actor.userId,
  });

  return version;
};

export const listAutomations = async (
  client: Db,
  actor: Actor,
  query: { status?: AutomationRow['status'] },
) => {
  const rows = await client
    .select()
    .from(automations)
    .where(
      and(
        eq(automations.orgId, actor.orgId),
        query.status ? eq(automations.status, query.status) : undefined,
      ),
    )
    .orderBy(desc(automations.updatedAt));

  const stats = await statsOf(
    client,
    actor.orgId,
    rows.map((row) => row.id),
  );

  return { data: rows.map((row) => toAutomationDto(row, stats.get(row.id))) };
};

export const getAutomation = async (client: Db, actor: Actor, id: string) => {
  const row = await findAutomation(client, actor.orgId, id);

  return toAutomationDto(row, (await statsOf(client, actor.orgId, [id])).get(id));
};

export const createAutomation = async (
  client: Db,
  actor: Actor,
  input: { name: string; description?: string | null; definition: AutomationDefinition },
) => {
  const values = {
    id: newId(),
    orgId: actor.orgId,
    name: input.name,
    description: input.description ?? null,
    definition: input.definition,
    triggerEvent: triggerKey(input.definition),
    createdBy: actor.userId,
  };

  await client.insert(automations).values(values);
  await recordAudit(client, userCaller(actor), {
    action: 'automation.created',
    targetType: 'automation',
    targetId: values.id,
    targetLabel: values.name,
  });

  return getAutomation(client, actor, values.id);
};

export const updateAutomation = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { name?: string; description?: string | null; definition?: AutomationDefinition },
) => {
  const before = await findAutomation(client, actor.orgId, id);
  // An active automation publishes the change at once (checked first); runs in progress keep their version.
  const published = input.definition && before.status === 'active' ? input.definition : null;

  if (published) await checkDefinition(client, actor.orgId, published);

  const activeVersion = published
    ? await publish(client, actor, before, published)
    : before.activeVersion;

  await client
    .update(automations)
    .set({
      name: input.name,
      description: input.description,
      definition: input.definition,
      triggerEvent: input.definition && triggerKey(input.definition),
      activeVersion,
      ...(published ? { activatedBy: actor.userId, nextRunAt: firstRunAt(published) } : {}),
      updatedAt: sql`now()`,
    })
    .where(eq(automations.id, id));
  await recordAudit(client, userCaller(actor), {
    action: 'automation.updated',
    targetType: 'automation',
    targetId: id,
    targetLabel: input.name ?? before.name,
    metadata: published ? { publishedVersion: activeVersion } : undefined,
  });

  return getAutomation(client, actor, id);
};

/** Checks the definition, publishes it as a new version and turns the automation on, acting as this member. */
export const activateAutomation = async (client: Db, actor: Actor, id: string) => {
  const row = await findAutomation(client, actor.orgId, id);
  const definition = AutomationDefinition.parse(row.definition);

  await checkDefinition(client, actor.orgId, definition);

  const version = await publish(client, actor, row, definition);

  await client
    .update(automations)
    .set({
      status: 'active',
      activeVersion: version,
      activatedBy: actor.userId,
      nextRunAt: firstRunAt(definition),
      updatedAt: sql`now()`,
    })
    .where(eq(automations.id, id));
  await recordAudit(client, userCaller(actor), {
    action: 'automation.activated',
    targetType: 'automation',
    targetId: id,
    targetLabel: row.name,
    metadata: { version },
  });

  return getAutomation(client, actor, id);
};

/** No new runs start; runs in progress finish. */
export const pauseAutomation = async (client: Db, actor: Actor, id: string) => {
  const row = await findAutomation(client, actor.orgId, id);

  await client
    .update(automations)
    .set({ status: 'paused', nextRunAt: null, updatedAt: sql`now()` })
    .where(eq(automations.id, id));
  await recordAudit(client, userCaller(actor), {
    action: 'automation.paused',
    targetType: 'automation',
    targetId: id,
    targetLabel: row.name,
  });

  return getAutomation(client, actor, id);
};

export const removeAutomation = async (client: Db, actor: Actor, id: string) => {
  const row = await findAutomation(client, actor.orgId, id);

  await client.delete(automations).where(eq(automations.id, id));
  await recordAudit(client, userCaller(actor), {
    action: 'automation.deleted',
    targetType: 'automation',
    targetId: id,
    targetLabel: row.name,
  });

  return { ok: true as const };
};

export const listVersions = async (client: Db, actor: Actor, id: string) => {
  await findAutomation(client, actor.orgId, id);

  const rows = await client
    .select()
    .from(automationVersions)
    .where(and(eq(automationVersions.orgId, actor.orgId), eq(automationVersions.automationId, id)))
    .orderBy(desc(automationVersions.version));

  return {
    data: rows.map((row) => ({
      version: row.version,
      publishedBy: row.publishedBy,
      createdAt: row.createdAt.toISOString(),
      definition: AutomationDefinition.parse(row.definition),
    })),
  };
};

/** An older version becomes the working copy; an active automation publishes it at once. */
export const restoreVersion = async (client: Db, actor: Actor, id: string, version: number) => {
  const [row] = await client
    .select()
    .from(automationVersions)
    .where(
      and(
        eq(automationVersions.orgId, actor.orgId),
        eq(automationVersions.automationId, id),
        eq(automationVersions.version, version),
      ),
    )
    .limit(1);

  if (!row) throw notFound('Version');

  return updateAutomation(client, actor, id, {
    definition: AutomationDefinition.parse(row.definition),
  });
};
