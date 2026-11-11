import type { Automation, AutomationDefinition, AutomationRun, AutomationStep, CursorQuery, RunStep } from '@erxes/core-contract';
import {
  automationRuns,
  automationRunSteps,
  automations,
  automationVersions,
  type Db,
  newId,
  pluginInstallations,
  plugins,
} from '@erxes/core-db';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { recordAudit } from '~/modules/audit/audit.service';
import { eventTypeCatalog } from '~/modules/webhooks/webhooks.service';
import { actionCatalog } from './actions';
import { cancelRun, retryRun } from './engine';

type AutomationRow = typeof automations.$inferSelect;
type RunRow = typeof automationRuns.$inferSelect;

const statsOf = async (client: Db, orgId: string, ids: string[]) => {
  if (!ids.length) return new Map<string, Automation['stats']>();

  const rows = await client
    .select({ automationId: automationRuns.automationId, status: automationRuns.status, count: sql<number>`count(*)::int` })
    .from(automationRuns)
    .where(and(eq(automationRuns.orgId, orgId), sql`${automationRuns.automationId} in (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`))
    .groupBy(automationRuns.automationId, automationRuns.status);
  const stats = new Map<string, Automation['stats']>();

  for (const row of rows) {
    const entry = stats.get(row.automationId) ?? { running: 0, succeeded: 0, failed: 0 };

    if (row.status === 'running' || row.status === 'waiting') entry.running += row.count;
    if (row.status === 'succeeded') entry.succeeded += row.count;
    if (row.status === 'failed') entry.failed += row.count;
    stats.set(row.automationId, entry);
  }

  return stats;
};

const toAutomationDto = (row: AutomationRow, stats?: Automation['stats']): Automation => ({
  id: row.id,
  name: row.name,
  description: row.description,
  status: row.status,
  definition: row.definition as unknown as AutomationDefinition,
  activeVersion: row.activeVersion,
  activatedBy: row.activatedBy,
  stats: stats ?? { running: 0, succeeded: 0, failed: 0 },
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const toRunDto = (row: RunRow): AutomationRun => ({
  id: row.id,
  automationId: row.automationId,
  version: row.version,
  eventId: row.eventId,
  eventType: row.eventType,
  subject: row.subjectType && row.subjectId ? { type: row.subjectType as 'customer' | 'company', id: row.subjectId } : null,
  status: row.status,
  error: row.error,
  waitingUntil: row.waitingUntil?.toISOString() ?? null,
  startedAt: row.startedAt.toISOString(),
  finishedAt: row.finishedAt?.toISOString() ?? null,
});

const installedPlugins = (client: Db, orgId: string) =>
  client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(and(eq(pluginInstallations.orgId, orgId), eq(pluginInstallations.status, 'active'), eq(plugins.status, 'active')));

export const automationCatalog = async (client: Db, orgId: string) => {
  const triggers = await eventTypeCatalog(client, orgId);

  return {
    triggers: triggers.map((item) => ({ type: item.type, label: item.label, source: item.source, subject: item.subject })),
    actions: actionCatalog(await installedPlugins(client, orgId)),
  };
};

const walk = (steps: AutomationStep[], visit: (step: AutomationStep) => void) => {
  for (const step of steps) {
    visit(step);
    if (step.type === 'branch') {
      walk(step.then, visit);
      walk(step.else, visit);
    }
  }
};

/**
 * What would make a definition fail at run time, found before it runs:
 * unknown triggers or actions, missing required fields, a step that needs a
 * customer when the event isn't about one, delays without a length, repeated
 * step ids.
 */
export const checkDefinition = async (client: Db, orgId: string, definition: AutomationDefinition) => {
  const catalog = await automationCatalog(client, orgId);
  const trigger = catalog.triggers.find((item) => item.type === definition.trigger.event);
  const problems: string[] = [];
  const ids = new Set<string>();

  if (!trigger) problems.push(`Unknown trigger ${definition.trigger.event}`);

  walk(definition.steps, (step) => {
    if (ids.has(step.id)) problems.push(`Two steps share the id ${step.id}`);
    ids.add(step.id);

    if (step.type === 'delay' && !step.until && !step.amount) problems.push(`Step ${step.id}: how long to wait?`);

    if (step.type !== 'action') return;

    const action = catalog.actions.find((item) => item.type === step.action);

    if (!action) {
      problems.push(`Step ${step.id}: unknown action ${step.action}`);
      return;
    }

    for (const field of action.fields) {
      const value = step.input[field.key];

      if (field.required && (value === undefined || value === null || value === '')) {
        problems.push(`Step ${step.id} (${action.label}): ${field.label} is required`);
      }
    }

    if (trigger && action.subject && action.subject !== 'any' && trigger.subject && action.subject !== trigger.subject) {
      problems.push(`Step ${step.id} (${action.label}) needs a ${action.subject}, but ${trigger.label} is about a ${trigger.subject}`);
    }

    if (trigger && action.subject && !trigger.subject && trigger.source === 'core') {
      problems.push(`Step ${step.id} (${action.label}) needs a customer or company, but ${trigger.label} isn't about one`);
    }
  });

  if (problems.length) throw new HttpError(400, 'INVALID_AUTOMATION', problems[0]!, { problems });
};

const findAutomation = async (client: Db, orgId: string, id: string) => {
  const [row] = await client.select().from(automations).where(and(eq(automations.orgId, orgId), eq(automations.id, id))).limit(1);

  if (!row) throw notFound('Automation');

  return row;
};

const publish = async (client: Db, actor: Actor, row: AutomationRow, definition: AutomationDefinition) => {
  const version = (row.activeVersion ?? 0) + 1;

  await client.insert(automationVersions).values({
    orgId: actor.orgId,
    automationId: row.id,
    version,
    definition: definition as unknown as Record<string, unknown>,
    publishedBy: actor.userId,
  });

  return version;
};

export const listAutomations = async (client: Db, actor: Actor, query: { status?: 'draft' | 'active' | 'paused' }) => {
  const rows = await client
    .select()
    .from(automations)
    .where(and(eq(automations.orgId, actor.orgId), query.status ? eq(automations.status, query.status) : undefined))
    .orderBy(desc(automations.updatedAt));
  const stats = await statsOf(client, actor.orgId, rows.map((row) => row.id));

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
  const [row] = await client
    .insert(automations)
    .values({
      id: newId(),
      orgId: actor.orgId,
      name: input.name,
      description: input.description ?? null,
      definition: input.definition as unknown as Record<string, unknown>,
      triggerEvent: input.definition.trigger.event,
      createdBy: actor.userId,
    })
    .returning();

  await recordAudit(client, userCaller(actor), { action: 'automation.created', targetType: 'automation', targetId: row!.id, targetLabel: row!.name });

  return toAutomationDto(row!);
};

export const updateAutomation = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { name?: string; description?: string | null; definition?: AutomationDefinition },
) => {
  const before = await findAutomation(client, actor.orgId, id);
  let activeVersion = before.activeVersion;

  // An active automation publishes the change at once (checked first); runs in progress keep their version.
  if (input.definition && before.status === 'active') {
    await checkDefinition(client, actor.orgId, input.definition);
    activeVersion = await publish(client, actor, before, input.definition);
  }

  const [row] = await client
    .update(automations)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.definition
        ? { definition: input.definition as unknown as Record<string, unknown>, triggerEvent: input.definition.trigger.event }
        : {}),
      activeVersion,
      ...(input.definition && before.status === 'active' ? { activatedBy: actor.userId } : {}),
      updatedAt: sql`now()`,
    })
    .where(eq(automations.id, id))
    .returning();

  await recordAudit(client, userCaller(actor), {
    action: 'automation.updated',
    targetType: 'automation',
    targetId: id,
    targetLabel: row!.name,
    metadata: input.definition && before.status === 'active' ? { publishedVersion: activeVersion } : undefined,
  });

  return getAutomation(client, actor, id);
};

/** Checks the definition, publishes it as a new version and turns the automation on, acting as this member. */
export const activateAutomation = async (client: Db, actor: Actor, id: string) => {
  const row = await findAutomation(client, actor.orgId, id);
  const definition = row.definition as unknown as AutomationDefinition;

  await checkDefinition(client, actor.orgId, definition);

  const version = await publish(client, actor, row, definition);

  await client
    .update(automations)
    .set({ status: 'active', activeVersion: version, activatedBy: actor.userId, updatedAt: sql`now()` })
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

  await client.update(automations).set({ status: 'paused', updatedAt: sql`now()` }).where(eq(automations.id, id));
  await recordAudit(client, userCaller(actor), { action: 'automation.paused', targetType: 'automation', targetId: id, targetLabel: row.name });

  return getAutomation(client, actor, id);
};

export const removeAutomation = async (client: Db, actor: Actor, id: string) => {
  const row = await findAutomation(client, actor.orgId, id);

  await client.delete(automations).where(eq(automations.id, id));
  await recordAudit(client, userCaller(actor), { action: 'automation.deleted', targetType: 'automation', targetId: id, targetLabel: row.name });

  return { ok: true as const };
};

export const listRuns = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & { id: string; status?: 'running' | 'waiting' | 'succeeded' | 'failed' | 'cancelled' },
) => {
  await findAutomation(client, actor.orgId, query.id);

  const page = await keysetPage(
    client,
    {
      table: automationRuns,
      id: automationRuns.id,
      createdAt: automationRuns.startedAt,
      scope: and(eq(automationRuns.orgId, actor.orgId), eq(automationRuns.automationId, query.id))!,
      countCap: 10_000,
    },
    query.status ? eq(automationRuns.status, query.status) : undefined,
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(automationRuns)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: page.data.map(toRunDto) };
};

const findRun = async (client: Db, orgId: string, runId: string) => {
  const [row] = await client.select().from(automationRuns).where(and(eq(automationRuns.orgId, orgId), eq(automationRuns.id, runId))).limit(1);

  if (!row) throw notFound('Run');

  return row;
};

export const getRun = async (client: Db, actor: Actor, runId: string) => {
  const run = await findRun(client, actor.orgId, runId);
  const steps = await client
    .select()
    .from(automationRunSteps)
    .where(and(eq(automationRunSteps.orgId, actor.orgId), eq(automationRunSteps.runId, runId)))
    .orderBy(asc(automationRunSteps.finishedAt));

  return {
    run: toRunDto(run),
    steps: steps.map(
      (step): RunStep => ({
        id: step.id,
        stepId: step.stepId,
        type: step.type,
        status: step.status,
        input: step.input,
        output: step.output,
        error: step.error,
        attempt: step.attempt,
        startedAt: step.startedAt.toISOString(),
        finishedAt: step.finishedAt.toISOString(),
      }),
    ),
  };
};

export const retryAutomationRun = async (client: Db, actor: Actor, runId: string) => {
  await findRun(client, actor.orgId, runId);

  const run = await retryRun(client, actor.orgId, runId);

  if (!run) throw new HttpError(409, 'NOT_FAILED', 'Only a failed run can be retried');

  return toRunDto(run);
};

export const cancelAutomationRun = async (client: Db, actor: Actor, runId: string) => {
  await findRun(client, actor.orgId, runId);

  const run = await cancelRun(client, actor.orgId, runId);

  if (!run) throw new HttpError(409, 'NOT_RUNNING', 'Only a running or waiting run can be cancelled');

  return toRunDto(run);
};
