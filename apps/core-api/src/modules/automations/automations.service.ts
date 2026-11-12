import {
  type Automation,
  AutomationDefinition,
  type AutomationRun,
  type AutomationStep,
  type CursorQuery,
  type RunStep,
} from '@erxes/core-contract';
import {
  automationRuns,
  automationRunSteps,
  automations,
  automationVersions,
  type Db,
  fields,
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
import { evaluateGroup } from './conditions';
import {
  cancelRun,
  type Cursor,
  definitionOf,
  nextCursor,
  retryRun,
  splitPath,
  stepAt,
  subjectOf,
} from './engine';
import { render } from './templates';
import { firstRunAt, startNow, triggerKey } from './triggers';

type AutomationRow = typeof automations.$inferSelect;

type RunRow = typeof automationRuns.$inferSelect;

const statsOf = async (client: Db, orgId: string, ids: string[]) => {
  if (!ids.length) return new Map<string, Automation['stats']>();

  const rows = await client
    .select({
      automationId: automationRuns.automationId,
      status: automationRuns.status,
      count: sql<number>`count(*)::int`,
    })
    .from(automationRuns)
    .where(
      and(
        eq(automationRuns.orgId, orgId),
        sql`${automationRuns.automationId} in (${sql.join(
          ids.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      ),
    )
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
  definition: AutomationDefinition.parse(row.definition),
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
  subject:
    row.subjectType && row.subjectId
      ? { type: row.subjectType as 'customer' | 'company', id: row.subjectId }
      : null,
  status: row.status,
  goalReached: Boolean(row.goalReachedAt),
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
    .where(
      and(
        eq(pluginInstallations.orgId, orgId),
        eq(pluginInstallations.status, 'active'),
        eq(plugins.status, 'active'),
      ),
    );

export const automationCatalog = async (client: Db, orgId: string) => {
  const triggers = await eventTypeCatalog(client, orgId);

  return {
    triggers: triggers.map((item) => ({
      type: item.type,
      label: item.label,
      description: item.description ?? null,
      source: item.source,
      subject: item.subject,
    })),
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

    if (step.type === 'switch') {
      step.cases.forEach((item) => walk(item.steps, visit));
      walk(step.otherwise, visit);
    }

    if (step.type === 'split') step.paths.forEach((path) => walk(path.steps, visit));
  }
};

/** Which record runs are about, given the trigger (null: none). */
const subjectOfTrigger = (
  definition: AutomationDefinition,
  triggers: { type: string; subject: 'customer' | 'company' | null }[],
) => {
  const trigger = definition.trigger;

  if (trigger.kind === 'event')
    return triggers.find((item) => item.type === trigger.event)?.subject ?? null;

  if (trigger.kind === 'date') return trigger.subject;

  return trigger.audience?.type ?? null;
};

/**
 * What would make a definition fail at run time, found before it runs:
 * unknown triggers or actions, missing required fields, a step that needs a
 * customer when the event isn't about one, delays without a length, repeated
 * step ids.
 */
export const checkDefinition = async (
  client: Db,
  orgId: string,
  definition: AutomationDefinition,
) => {
  const catalog = await automationCatalog(client, orgId);
  const trigger = definition.trigger;
  const subject = subjectOfTrigger(definition, catalog.triggers);
  const problems: string[] = [];
  const ids = new Set<string>();

  if (trigger.kind === 'event' && !catalog.triggers.some((item) => item.type === trigger.event)) {
    problems.push(`Unknown trigger ${trigger.event}`);
  }

  if (trigger.kind === 'date' && trigger.field !== 'birthDate') {
    const [field] = await client
      .select({ type: fields.type })
      .from(fields)
      .where(and(eq(fields.orgId, orgId), eq(fields.id, trigger.field)))
      .limit(1);

    if (field?.type !== 'date') problems.push('The date trigger needs a date field');
  }

  walk(definition.steps, (step) => {
    if (ids.has(step.id)) problems.push(`Two steps share the id ${step.id}`);
    ids.add(step.id);

    if (step.type === 'delay' && !step.until && !step.amount)
      problems.push(`Step ${step.id}: how long to wait?`);

    if (step.type === 'wait_for') {
      if (!subject)
        problems.push(
          `Step ${step.id} waits for an event about the record, but runs aren't about one`,
        );

      if (!catalog.triggers.some((item) => item.type === step.event))
        problems.push(`Step ${step.id}: unknown event ${step.event}`);
    }

    if (step.type !== 'action') return;

    const action = catalog.actions.find((item) => item.type === step.action);

    if (!action) {
      problems.push(`Step ${step.id}: unknown action ${step.action}`);

      return;
    }

    for (const field of action.fields) {
      const value = step.input[field.key];

      if (
        field.required &&
        (value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && !value.length))
      ) {
        problems.push(`Step ${step.id} (${action.label}): ${field.label} is required`);
      }
    }

    if (action.subject && action.subject !== 'any' && subject && action.subject !== subject) {
      problems.push(
        `Step ${step.id} (${action.label}) needs a ${action.subject}, but runs are about a ${subject}`,
      );
    }

    if (action.subject && !subject) {
      problems.push(
        `Step ${step.id} (${action.label}) needs a customer or company, but runs aren't about one`,
      );
    }
  });

  // Templates must only use filters that exist.
  try {
    walk(definition.steps, (step) => {
      if (step.type === 'action') render(step.input, {});
    });
  } catch (error) {
    problems.push((error as Error).message);
  }

  if (problems.length) throw new HttpError(400, 'INVALID_AUTOMATION', problems[0]!, { problems });
};

const findAutomation = async (client: Db, orgId: string, id: string) => {
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
    definition: definition,
    publishedBy: actor.userId,
  });

  return version;
};

export const listAutomations = async (
  client: Db,
  actor: Actor,
  query: { status?: 'draft' | 'active' | 'paused' },
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
  const [row] = await client
    .insert(automations)
    .values({
      id: newId(),
      orgId: actor.orgId,
      name: input.name,
      description: input.description ?? null,
      definition: input.definition,
      triggerEvent: triggerKey(input.definition),
      createdBy: actor.userId,
    })
    .returning();

  await recordAudit(client, userCaller(actor), {
    action: 'automation.created',
    targetType: 'automation',
    targetId: row!.id,
    targetLabel: row!.name,
  });

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
        ? {
            definition: input.definition,
            triggerEvent: triggerKey(input.definition),
          }
        : {}),
      activeVersion,
      ...(input.definition && before.status === 'active'
        ? { activatedBy: actor.userId, nextRunAt: firstRunAt(input.definition) }
        : {}),
      updatedAt: sql`now()`,
    })
    .where(eq(automations.id, id))
    .returning();

  await recordAudit(client, userCaller(actor), {
    action: 'automation.updated',
    targetType: 'automation',
    targetId: id,
    targetLabel: row!.name,
    metadata:
      input.definition && before.status === 'active'
        ? { publishedVersion: activeVersion }
        : undefined,
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

export const listRuns = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & {
    id: string;
    status?: 'running' | 'waiting' | 'succeeded' | 'failed' | 'cancelled';
  },
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
  const [row] = await client
    .select()
    .from(automationRuns)
    .where(and(eq(automationRuns.orgId, orgId), eq(automationRuns.id, runId)))
    .limit(1);

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
    steps: steps.map((step): RunStep => ({
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
    })),
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

  if (!run)
    throw new HttpError(409, 'NOT_RUNNING', 'Only a running or waiting run can be cancelled');

  return toRunDto(run);
};

// ─── Starting, testing, numbers, versions ──────────────────────────────────

export const startAutomation = async (
  client: Db,
  actor: Actor,
  id: string,
  subjects?: string[],
) => {
  const row = await findAutomation(client, actor.orgId, id);

  if (row.status !== 'active' || !row.activeVersion)
    throw new HttpError(409, 'NOT_ACTIVE', 'Turn the automation on first');

  const definition = await definitionOf(client, id, row.activeVersion);

  if (!definition) throw new HttpError(409, 'NOT_ACTIVE', 'Turn the automation on first');

  const result = await startNow(client, row, definition, subjects);

  await recordAudit(client, userCaller(actor), {
    action: 'automation.started',
    targetType: 'automation',
    targetId: id,
    targetLabel: row.name,
    metadata: result,
  });

  return result;
};

/**
 * A dry run of the working copy for one record: which way each branch goes,
 * what each action would get (placeholders filled), where it would wait.
 * Nothing is changed.
 */
export const testAutomation = async (
  client: Db,
  actor: Actor,
  id: string,
  input: {
    subject?: { type: 'customer' | 'company'; id: string };
    payload?: Record<string, unknown>;
    assumeEventHappens: boolean;
  },
) => {
  const row = await findAutomation(client, actor.orgId, id);
  const definition = AutomationDefinition.parse(row.definition);
  const catalog = await automationCatalog(client, actor.orgId);
  const trigger = definition.trigger;

  const subject = input.subject
    ? await subjectOf(client, actor.orgId, input.subject.type, input.subject.id)
    : null;

  if (input.subject && !subject)
    throw notFound(input.subject.type === 'customer' ? 'Customer' : 'Company');

  const eventType = trigger.kind === 'event' ? trigger.event : trigger.kind;

  const context: Record<string, unknown> = {
    event: {
      type: eventType,
      occurredAt: new Date().toISOString(),
      payload: input.payload ?? {},
      subject: input.subject ?? null,
    },
    subject,
    steps: {},
  };

  const triggerConditions =
    trigger.kind === 'event' || trigger.kind === 'date'
      ? trigger.conditions
      : 'audience' in trigger
        ? trigger.audience?.conditions
        : undefined;

  const trace: {
    stepId: string;
    type: string;
    outcome: string;
    input: unknown;
    problem: string | null;
  }[] = [];

  const goalMetAtStart = Boolean(definition.goal && evaluateGroup(definition.goal, context));
  let cursor: Cursor | null = [0];

  for (let guard = 0; cursor && guard < 200; guard += 1) {
    const step = stepAt(definition.steps, cursor);

    if (!step) break;

    if (definition.goal && evaluateGroup(definition.goal, context)) {
      trace.push({
        stepId: step.id,
        type: 'goal',
        outcome: 'The goal is met: the record leaves here',
        input: null,
        problem: null,
      });
      break;
    }

    let next: Cursor | null = nextCursor(definition.steps, cursor);
    let outcome = '';
    let rendered: unknown = null;
    let problem: string | null = null;
    let output: unknown = null;

    if (step.type === 'action') {
      const action = catalog.actions.find((item) => item.type === step.action);

      try {
        rendered = render(step.input, context);
      } catch (error) {
        problem = (error as Error).message;
      }

      outcome = `Would run “${action?.label ?? step.action}”`;

      if (!action) problem = `Unknown action ${step.action}`;
      else if (action.subject && !subject)
        problem = 'Needs a customer or company: pick one to test with';
    } else if (step.type === 'delay') {
      outcome = step.until
        ? `Would wait until ${String(render(step.until, context))}`
        : `Would wait ${step.amount} ${step.unit}`;
    } else if (step.type === 'wait_for') {
      outcome = input.assumeEventHappens
        ? `Would wait for ${step.event} (up to ${step.amount} ${step.unit}); assumed it happens`
        : `Would wait for ${step.event} up to ${step.amount} ${step.unit}; assumed it doesn't`;
      output = { matched: input.assumeEventHappens };
    } else if (step.type === 'branch') {
      const matched = evaluateGroup(step.conditions, context);

      outcome = matched
        ? 'Conditions hold: “if it matches” path'
        : 'Conditions don’t hold: “otherwise” path';
      output = { matched };
      next = [...cursor, matched ? 'then' : 'else', 0];

      if (!stepAt(definition.steps, next)) next = nextCursor(definition.steps, cursor);
    } else if (step.type === 'switch') {
      const chosen = step.cases.findIndex((item) => evaluateGroup(item.conditions, context));

      outcome =
        chosen >= 0
          ? `Case ${chosen + 1}${step.cases[chosen]!.label ? ` (${step.cases[chosen]!.label})` : ''}`
          : 'Otherwise';
      output = { case: chosen >= 0 ? chosen : 'otherwise' };
      next = [...cursor, chosen >= 0 ? `case:${chosen}` : 'otherwise', 0];

      if (!stepAt(definition.steps, next)) next = nextCursor(definition.steps, cursor);
    } else if (step.type === 'split') {
      const path = splitPath(`test:${input.subject?.id ?? 'none'}`, step);

      outcome = `Path ${path + 1}${step.paths[path]!.label ? ` (${step.paths[path]!.label})` : ''} (chosen at random by weight)`;
      output = { path };
      next = [...cursor, `path:${path}`, 0];

      if (!stepAt(definition.steps, next)) next = nextCursor(definition.steps, cursor);
    } else {
      outcome = 'Stops here';
      next = null;
    }

    context.steps = { ...(context.steps as Record<string, unknown>), [step.id]: { output } };
    trace.push({
      stepId: step.id,
      type: step.type === 'action' ? step.action : step.type,
      outcome,
      input: rendered,
      problem,
    });
    cursor = next;
  }

  return { triggerMatches: evaluateGroup(triggerConditions, context), goalMetAtStart, trace };
};

export const automationStats = async (client: Db, actor: Actor, id: string) => {
  const row = await findAutomation(client, actor.orgId, id);
  const since = sql`now() - interval '30 days'`;

  const [runs] = await client
    .select({
      total: sql<number>`count(*)::int`,
      running: sql<number>`count(*) filter (where ${automationRuns.status} in ('running', 'waiting'))::int`,
      succeeded: sql<number>`count(*) filter (where ${automationRuns.status} = 'succeeded')::int`,
      failed: sql<number>`count(*) filter (where ${automationRuns.status} = 'failed')::int`,
      cancelled: sql<number>`count(*) filter (where ${automationRuns.status} = 'cancelled')::int`,
      goalReached: sql<number>`count(*) filter (where ${automationRuns.goalReachedAt} is not null)::int`,
    })
    .from(automationRuns)
    .where(
      and(
        eq(automationRuns.orgId, actor.orgId),
        eq(automationRuns.automationId, id),
        sql`${automationRuns.startedAt} > ${since}`,
      ),
    );

  const steps = await client
    .select({
      stepId: automationRunSteps.stepId,
      succeeded: sql<number>`count(*) filter (where ${automationRunSteps.status} = 'succeeded')::int`,
      failed: sql<number>`count(*) filter (where ${automationRunSteps.status} = 'failed')::int`,
      skipped: sql<number>`count(*) filter (where ${automationRunSteps.status} = 'skipped')::int`,
    })
    .from(automationRunSteps)
    .innerJoin(automationRuns, eq(automationRuns.id, automationRunSteps.runId))
    .where(
      and(
        eq(automationRuns.orgId, actor.orgId),
        eq(automationRuns.automationId, id),
        sql`${automationRuns.startedAt} > ${since}`,
      ),
    )
    .groupBy(automationRunSteps.stepId);

  return {
    runs: runs ?? { total: 0, running: 0, succeeded: 0, failed: 0, cancelled: 0, goalReached: 0 },
    steps,
    skippedByLimit: Number((row.state as { skippedByLimit?: number }).skippedByLimit ?? 0),
  };
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

/** Built-in fields of customers and companies, and the organisation's custom fields. */
export const automationFields = async (
  client: Db,
  actor: Actor,
  subject?: 'customer' | 'company',
) => {
  const common = [
    { path: 'event.type', label: 'Event type', type: 'text' as const },
    { path: 'event.actor.type', label: 'Who did it (user, plugin, system)', type: 'text' as const },
    { path: 'event.payload', label: 'Event details', type: 'text' as const },
  ];

  const customer = [
    { path: 'subject.firstName', label: 'First name', type: 'text' as const },
    { path: 'subject.lastName', label: 'Last name', type: 'text' as const },
    { path: 'subject.primaryEmail', label: 'Email', type: 'text' as const },
    { path: 'subject.primaryPhone', label: 'Phone', type: 'text' as const },
    {
      path: 'subject.state',
      label: 'State',
      type: 'select' as const,
      options: ['lead', 'customer'],
    },
    { path: 'subject.ownerId', label: 'Owner', type: 'member' as const },
    { path: 'subject.tagIds', label: 'Tags', type: 'tags' as const },
    { path: 'subject.birthDate', label: 'Birthday', type: 'date' as const },
    { path: 'subject.createdAt', label: 'Created', type: 'date' as const },
  ];

  const company = [
    { path: 'subject.primaryName', label: 'Name', type: 'text' as const },
    { path: 'subject.ownerId', label: 'Owner', type: 'member' as const },
    { path: 'subject.tagIds', label: 'Tags', type: 'tags' as const },
    { path: 'subject.createdAt', label: 'Created', type: 'date' as const },
  ];

  const custom = await client
    .select({
      id: fields.id,
      label: fields.label,
      type: fields.type,
      options: fields.options,
      contentType: fields.contentType,
    })
    .from(fields)
    .where(
      and(eq(fields.orgId, actor.orgId), subject ? eq(fields.contentType, subject) : undefined),
    );

  const typeOf = (type: string) =>
    type === 'number'
      ? 'number'
      : type === 'date'
        ? 'date'
        : type === 'boolean'
          ? 'boolean'
          : type.includes('select') || type === 'radio'
            ? 'select'
            : 'text';

  return {
    data: [
      ...common,
      ...(subject === 'company'
        ? company
        : subject === 'customer'
          ? customer
          : [...customer, ...company.filter((item) => item.path === 'subject.primaryName')]),
      ...custom.map((field) => ({
        path: `subject.customFields.${field.id}`,
        label: `${field.label} (custom)`,
        type: typeOf(field.type) as 'text',
        options: Array.isArray(field.options)
          ? (field.options as { label?: string; value?: string }[]).map((option) =>
              String(option.value ?? option.label ?? option),
            )
          : undefined,
      })),
    ],
  };
};
