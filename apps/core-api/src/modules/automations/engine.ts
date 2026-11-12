import { AutomationDefinition, type AutomationStep } from '@erxes/core-contract';
import type { events } from '@erxes/core-db';
import {
  automationRuns,
  automationRunSteps,
  automations,
  automationVersions,
  type Db,
  newId,
  pluginInstallations,
  roles,
  type Transaction,
  users,
} from '@erxes/core-db';
import { and, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import type { Actor } from '~/http/auth';
import { withRunCause } from '~/lib/causation';
import { log } from '~/lib/log';
import { toEventDto } from '~/modules/events/events.service';
import type { EventConsumer } from '~/modules/events/processor';
import { enqueueJob, type JobDefinition } from '~/modules/jobs/jobs';
import { notify } from '~/modules/notifications/notifications.service';
import { CORE_ACTIONS, pluginOfAction, runPluginAction } from './actions';
import { evaluateGroup } from './conditions';
import { render } from './templates';

type RunRow = typeof automationRuns.$inferSelect;

type AutomationRow = typeof automations.$inferSelect;

type EventRow = typeof events.$inferSelect;

/** Automations started by events that automations caused stop this deep. */
export const MAX_CHAIN_DEPTH = 5;

/** A run that loops through steps (branches can't, but be safe) stops after this many. */
const MAX_STEPS_PER_RUN = 500;

export type Cursor = (number | string)[];

/**
 * The steps inside a step's arm: `then`/`else` (branch), `case:N`/`otherwise`
 * (switch), `path:N` (split).
 */
export const armSteps = (step: AutomationStep, arm: string): AutomationStep[] | null => {
  if (step.type === 'branch') return arm === 'then' ? step.then : arm === 'else' ? step.else : null;

  if (step.type === 'switch') {
    if (arm === 'otherwise') return step.otherwise;

    if (arm.startsWith('case:')) return step.cases[Number(arm.slice(5))]?.steps ?? null;
  }

  if (step.type === 'split' && arm.startsWith('path:'))
    return step.paths[Number(arm.slice(5))]?.steps ?? null;

  return null;
};

/** The step a cursor points at (`[2, "then", 0]`, `[1, "case:0", 3]`), or null past the end. */
export const stepAt = (steps: AutomationStep[], cursor: Cursor): AutomationStep | null => {
  let list = steps;
  let step: AutomationStep | undefined;

  for (let index = 0; index < cursor.length; index += 2) {
    step = list[cursor[index] as number];

    if (!step) return null;

    const arm = cursor[index + 1];

    if (arm !== undefined) {
      const inner = armSteps(step, String(arm));

      if (!inner) return null;
      list = inner;
    }
  }

  return step ?? null;
};

/** The step after `cursor`: the next in its list, else after the enclosing step. */
export const nextCursor = (steps: AutomationStep[], cursor: Cursor): Cursor | null => {
  let current = [...cursor];

  for (;;) {
    const next = [...current.slice(0, -1), (current[current.length - 1] as number) + 1];

    if (stepAt(steps, next)) return next;

    if (current.length === 1) return null;

    current = current.slice(0, -2);
  }
};

/** Into an arm, or past the step when that arm is empty. */
const enterArm = (steps: AutomationStep[], cursor: Cursor, arm: string): Cursor | null => {
  const inside = [...cursor, arm, 0];

  return stepAt(steps, inside) ? inside : nextCursor(steps, cursor);
};

/** A split's path for a run: by weight, the same every time for the same run. */
export const splitPath = (runId: string, step: Extract<AutomationStep, { type: 'split' }>) => {
  const total = step.paths.reduce((sum, path) => sum + path.weight, 0);
  const roll = createHash('sha256').update(`${runId}:${step.id}`).digest().readUInt32BE(0) % total;
  let seen = 0;

  for (const [index, path] of step.paths.entries()) {
    seen += path.weight;

    if (roll < seen) return index;
  }

  return step.paths.length - 1;
};

const subjectOf = async (tx: Db, orgId: string, type: string | null, id: string | null) => {
  if (!type || !id) return null;

  const table =
    type === 'customer' ? 'core_customers' : type === 'company' ? 'core_companies' : null;

  if (!table) return null;

  const result = await tx.execute(
    sql`select * from ${sql.identifier(table)} where org_id = ${orgId} and id = ${id} limit 1`,
  );

  const row = result.rows[0];

  if (!row) return null;

  // camelCase, without internal columns: what templates and conditions read.
  const camel = Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => key !== 'org_id' && key !== 'search_text')
      .map(([key, value]) => [
        key.replace(/_([a-z])/g, (_m, c: string) => c.toUpperCase()),
        value instanceof Date ? value.toISOString() : value,
      ]),
  );

  const tags = await tx.execute<{ tag_id: string }>(
    sql`select tag_id from ${sql.identifier(type === 'customer' ? 'core_customer_tags' : 'core_company_tags')} where org_id = ${orgId} and ${sql.identifier(`${type}_id`)} = ${id}`,
  );

  return { ...camel, type, tagIds: tags.rows.map((tag) => tag.tag_id) };
};

const definitionOf = async (tx: Db, automationId: string, version: number) => {
  const [row] = await tx
    .select({ definition: automationVersions.definition })
    .from(automationVersions)
    .where(
      and(
        eq(automationVersions.automationId, automationId),
        eq(automationVersions.version, version),
      ),
    )
    .limit(1);

  return row ? AutomationDefinition.parse(row.definition) : null;
};

/**
 * The member an automation acts as, with their role's permissions read now:
 * a member who was disabled or lost a permission can't keep acting through it.
 */
const actorOf = async (tx: Db, orgId: string, userId: string | null): Promise<Actor> => {
  if (!userId) throw new Error('Nobody turned this automation on');

  const [row] = await tx
    .select({
      id: users.id,
      role: users.role,
      status: users.status,
      permissions: roles.permissions,
    })
    .from(users)
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .where(and(eq(users.orgId, orgId), eq(users.id, userId)))
    .limit(1);

  if (!row || row.status !== 'active')
    throw new Error('The member who turned this automation on is no longer active');

  return { userId: row.id, orgId, role: row.role, permissions: row.permissions };
};

const queueAdvance = (tx: Db, run: Pick<RunRow, 'id' | 'orgId'>, cursor: Cursor, runAt?: Date) =>
  enqueueJob(tx, {
    orgId: run.orgId,
    queue: 'automation.advance',
    payload: { runId: run.id },
    runAt,
    // One job per run and position: a step is never queued twice.
    dedupeKey: `${run.id}:${cursor.join('.')}:${runAt ? runAt.getTime() : 'now'}`,
    maxAttempts: 5,
  });

const logStep = (
  tx: Db,
  run: RunRow,
  step: AutomationStep,
  entry: {
    status: 'succeeded' | 'failed' | 'skipped';
    input?: unknown;
    output?: unknown;
    error?: string;
    attempt: number;
    startedAt: Date;
  },
) =>
  tx.insert(automationRunSteps).values({
    id: newId(),
    orgId: run.orgId,
    runId: run.id,
    stepId: step.id,
    type: step.type === 'action' ? step.action : step.type,
    status: entry.status,
    input: entry.input ?? null,
    output: entry.output ?? null,
    error: entry.error ?? null,
    attempt: entry.attempt,
    startedAt: entry.startedAt,
  });

const finish = (
  tx: Db,
  runId: string,
  status: 'succeeded' | 'failed' | 'cancelled',
  error?: string,
  goal = false,
) =>
  tx
    .update(automationRuns)
    .set({
      status,
      error: error ?? null,
      finishedAt: sql`now()`,
      waitingUntil: null,
      waitEvent: null,
      ...(goal ? { goalReachedAt: sql`now()` } : {}),
      updatedAt: sql`now()`,
    })
    .where(eq(automationRuns.id, runId));

const SECONDS = { minutes: 60, hours: 3600, days: 86_400 } as const;

const delayUntil = (
  step: Extract<AutomationStep, { type: 'delay' }>,
  context: Record<string, unknown>,
) => {
  if (step.until) {
    const rendered = render(step.until, context);
    const time = Date.parse(String(rendered));

    if (Number.isNaN(time)) throw new Error(`"${String(rendered)}" is not a date to wait until`);

    return new Date(time);
  }

  const seconds =
    { minutes: 60, hours: 3600, days: 86_400 }[step.unit ?? 'minutes'] * (step.amount ?? 1);

  return new Date(Date.now() + seconds * 1000);
};

/**
 * One step of a run, in the organisation's transaction together with the
 * run's progress (and the next step's job): a step is never half done. An
 * action that throws rolls everything back and the job retries; after the
 * last attempt the run fails at that step (`onDead`). Before each step the
 * goal is checked: met, the record leaves.
 */
export const advanceJob: JobDefinition = {
  queue: 'automation.advance',
  atomic: true,
  leaseSeconds: 120,
  backoff: (attempt) => [30, 120, 600, 1800][attempt - 1] ?? 3600,
  async handle(job, tx) {
    const db = tx as Transaction;

    const [run] = await db
      .select()
      .from(automationRuns)
      .where(
        and(
          eq(automationRuns.orgId, job.orgId),
          eq(automationRuns.id, job.payload.runId as string),
        ),
      )
      .for('update')
      .limit(1);

    // Cancelled or finished meanwhile.
    if (!run || (run.status !== 'running' && run.status !== 'waiting')) return;

    const [automation] = await db
      .select()
      .from(automations)
      .where(eq(automations.id, run.automationId))
      .limit(1);

    const definition = automation ? await definitionOf(db, run.automationId, run.version) : null;

    if (!automation || !definition) {
      await finish(db, run.id, 'failed', 'The automation or its version is gone');

      return;
    }

    const cursor = run.cursor;
    const step = stepAt(definition.steps, cursor);

    if (!step) {
      await finish(db, run.id, 'succeeded');

      return;
    }

    const [{ count } = { count: 0 }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(automationRunSteps)
      .where(eq(automationRunSteps.runId, run.id));

    if (count >= MAX_STEPS_PER_RUN) {
      await finish(db, run.id, 'failed', `Stopped after ${MAX_STEPS_PER_RUN} steps`);

      return;
    }

    const context = { ...run.context } as Record<string, unknown>;

    context.subject = await subjectOf(db, run.orgId, run.subjectType, run.subjectId);

    if (definition.goal && evaluateGroup(definition.goal, context)) {
      await db.update(automationRuns).set({ context }).where(eq(automationRuns.id, run.id));
      await finish(db, run.id, 'succeeded', undefined, true);

      return;
    }

    const startedAt = new Date();
    let next: Cursor | null = nextCursor(definition.steps, cursor);
    let output: unknown = null;
    let input: unknown = null;

    if (step.type === 'stop') {
      next = null;
    } else if (step.type === 'branch') {
      const matched = evaluateGroup(step.conditions, context);

      output = { matched };
      next = enterArm(definition.steps, cursor, matched ? 'then' : 'else');
    } else if (step.type === 'switch') {
      const chosen = step.cases.findIndex((item) => evaluateGroup(item.conditions, context));

      output = {
        case: chosen >= 0 ? chosen : 'otherwise',
        label: chosen >= 0 ? (step.cases[chosen]!.label ?? null) : null,
      };
      next = enterArm(definition.steps, cursor, chosen >= 0 ? `case:${chosen}` : 'otherwise');
    } else if (step.type === 'split') {
      const path = splitPath(run.id, step);

      output = { path, label: step.paths[path]!.label ?? null };
      next = enterArm(definition.steps, cursor, `path:${path}`);
    } else if (step.type === 'delay') {
      // First time here: wait. Woken up: carry on.
      if (run.status !== 'waiting') {
        const until = delayUntil(step, context);

        if (until.getTime() > Date.now()) {
          await db
            .update(automationRuns)
            .set({ status: 'waiting', waitingUntil: until, context, updatedAt: sql`now()` })
            .where(eq(automationRuns.id, run.id));
          await queueAdvance(db, run, cursor, until);

          return;
        }
      }

      output = { waitedUntil: run.waitingUntil?.toISOString() ?? startedAt.toISOString() };
    } else if (step.type === 'wait_for') {
      if (run.status !== 'waiting') {
        // Wait for the event (the consumer resumes the run) or the time limit (this job again).
        const until = new Date(Date.now() + SECONDS[step.unit] * step.amount * 1000);

        await db
          .update(automationRuns)
          .set({
            status: 'waiting',
            waitingUntil: until,
            waitEvent: step.event,
            context,
            updatedAt: sql`now()`,
          })
          .where(eq(automationRuns.id, run.id));
        await queueAdvance(db, run, cursor, until);

        return;
      }

      // Woken by the time limit: the event didn't happen.
      output = { matched: false, timedOut: true };
    } else {
      input = render(step.input, context);

      const actor = await actorOf(db, run.orgId, automation.activatedBy);

      const subject =
        run.subjectType && run.subjectId
          ? { type: run.subjectType as 'customer' | 'company', id: run.subjectId }
          : null;

      const ctx = {
        tx: db,
        orgId: run.orgId,
        actor,
        automation: { id: automation.id, name: automation.name },
        run: { id: run.id },
        step: { id: step.id },
        subject,
        input: input as Record<string, unknown>,
        context,
      };

      const core = CORE_ACTIONS.find((action) => action.type === step.action);

      output = await withRunCause(
        {
          runId: run.id,
          automationId: automation.id,
          automationName: automation.name,
          depth: run.depth,
        },
        async () => {
          if (core) return core.run(ctx);

          const plugin = await pluginOfAction(db, step.action);

          const [installed] = plugin
            ? await db
                .select({ status: pluginInstallations.status })
                .from(pluginInstallations)
                .where(
                  and(
                    eq(pluginInstallations.orgId, run.orgId),
                    eq(pluginInstallations.plugin, plugin.name),
                  ),
                )
                .limit(1)
            : [];

          if (
            !plugin ||
            installed?.status !== 'active' ||
            !plugin.manifest?.actions?.some((action) => action.type === step.action)
          ) {
            throw new Error(`No action ${step.action} (is its plugin installed?)`);
          }

          return runPluginAction(ctx, plugin, step.action);
        },
      );

      // Actions may have changed the subject: later steps see it as it is now.
      context.subject = await subjectOf(db, run.orgId, run.subjectType, run.subjectId);
    }

    await continueAfter(db, run, step, context, {
      input,
      output,
      next,
      attempt: job.attempts,
      startedAt,
    });
  },
  async onDead(job, error, tx) {
    const [run] = await tx
      .select()
      .from(automationRuns)
      .where(
        and(
          eq(automationRuns.orgId, job.orgId),
          eq(automationRuns.id, job.payload.runId as string),
        ),
      )
      .limit(1);

    if (!run || (run.status !== 'running' && run.status !== 'waiting')) return;

    const definition = await definitionOf(tx, run.automationId, run.version);
    const step = definition ? stepAt(definition.steps, run.cursor) : null;

    if (step)
      await logStep(tx, run, step, {
        status: 'failed',
        error,
        attempt: job.attempts,
        startedAt: new Date(),
      });

    await finish(tx, run.id, 'failed', error);
    await notifyFailure(tx, run, error);
  },
};

/** Logs the step, records its output and moves on (or finishes). */
const continueAfter = async (
  db: Db,
  run: RunRow,
  step: AutomationStep,
  context: Record<string, unknown>,
  entry: { input: unknown; output: unknown; next: Cursor | null; attempt: number; startedAt: Date },
) => {
  context.steps = {
    ...(context.steps ?? {}),
    [step.id]: { output: entry.output },
  };
  await logStep(db, run, step, {
    status: 'succeeded',
    input: entry.input,
    output: entry.output,
    attempt: entry.attempt,
    startedAt: entry.startedAt,
  });

  if (!entry.next) {
    await db.update(automationRuns).set({ context }).where(eq(automationRuns.id, run.id));
    await finish(db, run.id, 'succeeded');

    return;
  }

  await db
    .update(automationRuns)
    .set({
      context,
      cursor: entry.next,
      status: 'running',
      waitingUntil: null,
      waitEvent: null,
      updatedAt: sql`now()`,
    })
    .where(eq(automationRuns.id, run.id));
  await queueAdvance(db, run, entry.next);
};

/**
 * Tells whoever turned the automation on that a run failed — collapsed to
 * one notification an hour per automation, so a broken one doesn't flood them.
 */
const notifyFailure = async (tx: Db, run: RunRow, error: string) => {
  const [automation] = await tx
    .select()
    .from(automations)
    .where(eq(automations.id, run.automationId))
    .limit(1);

  if (!automation?.activatedBy) return;

  const hour = new Date().toISOString().slice(0, 13);

  await notify(
    tx,
    { orgId: run.orgId, actorType: 'system', actorId: null, source: 'core' } as never,
    {
      userIds: [automation.activatedBy],
      kind: 'core.automation.failed',
      title: `“${automation.name}” failed`,
      body: error.slice(0, 500),
      link: `/automations/${automation.id}`,
      priority: 'high',
      entity: { type: 'automation', id: automation.id },
      dedupeKey: `automation-failed:${automation.id}:${hour}`,
      data: { runId: run.id },
    },
  ).catch((notifyError: unknown) =>
    log.warn('could not notify about a failed run', { error: notifyError }),
  );
};

export interface RunStart {
  eventId: string;
  eventType: string;
  subject: { type: 'customer' | 'company'; id: string } | null;
  event: Record<string, unknown>;
  depth?: number;
}

/**
 * Starts a run unless the record already went through (re-entry), the
 * hourly limit is reached, or this start already happened (same `eventId`).
 */
export const startRun = async (
  tx: Db,
  automation: AutomationRow,
  definition: AutomationDefinition,
  start: RunStart,
) => {
  if (definition.reentry !== 'always' && start.subject) {
    const [earlier] = await tx
      .select({ id: automationRuns.id })
      .from(automationRuns)
      .where(
        and(
          eq(automationRuns.automationId, automation.id),
          eq(automationRuns.subjectId, start.subject.id),
          definition.reentry === 'daily'
            ? gt(automationRuns.startedAt, sql`now() - interval '1 day'`)
            : undefined,
        ),
      )
      .orderBy(desc(automationRuns.startedAt))
      .limit(1);

    if (earlier) return null;
  }

  if (definition.maxRunsPerHour) {
    const [recent] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(automationRuns)
      .where(
        and(
          eq(automationRuns.automationId, automation.id),
          gt(automationRuns.startedAt, sql`now() - interval '1 hour'`),
        ),
      );

    if ((recent?.count ?? 0) >= definition.maxRunsPerHour) {
      await tx
        .update(automations)
        .set({
          state: sql`jsonb_set(${automations.state}, '{skippedByLimit}', to_jsonb(coalesce((${automations.state}->>'skippedByLimit')::int, 0) + 1))`,
        })
        .where(eq(automations.id, automation.id));

      return null;
    }
  }

  const subject = start.subject
    ? await subjectOf(tx, automation.orgId, start.subject.type, start.subject.id)
    : null;

  const [run] = await tx
    .insert(automationRuns)
    .values({
      id: newId(),
      orgId: automation.orgId,
      automationId: automation.id,
      version: automation.activeVersion!,
      eventId: start.eventId,
      eventType: start.eventType,
      subjectType: start.subject?.type ?? null,
      subjectId: start.subject?.id ?? null,
      context: { event: start.event, subject, steps: {} },
      depth: start.depth ?? 0,
    })
    .onConflictDoNothing()
    .returning();

  if (run) await queueAdvance(tx, run, [0]);

  return run ?? null;
};

/**
 * The event stream → automations:
 * - starts runs of active automations triggered by this event (conditions
 *   holding; never an automation's own events; chains stop at depth 5);
 * - resumes runs waiting for this event about the same record;
 * - ends waiting runs whose goal this event's change met.
 */
export const automationsConsumer: EventConsumer = {
  name: 'core.automations',
  async handle(tx, event: EventRow) {
    const dto = toEventDto(event);

    if (event.subjectId) await resumeWaiting(tx, event, dto);

    if (event.depth >= MAX_CHAIN_DEPTH) {
      log.warn('automation chain too deep; not starting more', {
        event: event.id,
        depth: event.depth,
      });

      return;
    }

    // Records from a quiet import start nothing (the import's own choice).
    if ((event.payload as { _import?: { quiet?: boolean } } | null)?._import?.quiet) return;

    const candidates = await tx
      .select()
      .from(automations)
      .where(
        and(
          eq(automations.orgId, event.orgId),
          eq(automations.status, 'active'),
          eq(automations.triggerEvent, event.type),
        ),
      );

    if (!candidates.length) return;

    const cause = event.causedByRun
      ? (
          await tx
            .select({ automationId: automationRuns.automationId })
            .from(automationRuns)
            .where(eq(automationRuns.id, event.causedByRun))
            .limit(1)
        )[0]
      : undefined;

    const subject = await subjectOf(tx, event.orgId, event.subjectType, event.subjectId);
    const context = { event: dto, subject, steps: {} };

    for (const automation of candidates) {
      if (!automation.activeVersion || cause?.automationId === automation.id) continue;

      const definition = await definitionOf(tx, automation.id, automation.activeVersion);

      if (
        !definition ||
        definition.trigger.kind !== 'event' ||
        !evaluateGroup(definition.trigger.conditions, context)
      )
        continue;

      await startRun(tx, automation, definition, {
        eventId: event.id,
        eventType: event.type,
        subject:
          event.subjectType && event.subjectId
            ? { type: event.subjectType, id: event.subjectId }
            : null,
        event: dto,
        depth: event.depth,
      });
    }
  },
};

const resumeWaiting = async (tx: Db, event: EventRow, dto: ReturnType<typeof toEventDto>) => {
  const waiting = await tx
    .select()
    .from(automationRuns)
    .where(
      and(
        eq(automationRuns.orgId, event.orgId),
        eq(automationRuns.subjectId, event.subjectId!),
        eq(automationRuns.status, 'waiting'),
      ),
    )
    .for('update', { skipLocked: true });

  for (const run of waiting) {
    const definition = await definitionOf(tx, run.automationId, run.version);

    if (!definition) continue;

    const context = {
      ...run.context,
      subject: await subjectOf(tx, run.orgId, run.subjectType, run.subjectId),
    } as Record<string, unknown>;

    // The change met the goal: the record leaves now, not when the wait ends.
    if (definition.goal && evaluateGroup(definition.goal, context)) {
      await tx.update(automationRuns).set({ context }).where(eq(automationRuns.id, run.id));
      await finish(tx, run.id, 'succeeded', undefined, true);
      continue;
    }

    if (run.waitEvent !== event.type) continue;

    const cursor = run.cursor;
    const step = stepAt(definition.steps, cursor);

    if (step?.type !== 'wait_for' || !evaluateGroup(step.conditions, { ...context, event: dto }))
      continue;

    await continueAfter(tx, run, step, context, {
      input: null,
      output: { matched: true, event: dto },
      next: nextCursor(definition.steps, cursor),
      attempt: 1,
      startedAt: new Date(),
    });
  }
};

/** Continue a failed run at the step that failed. */
export const retryRun = async (tx: Db, orgId: string, runId: string) => {
  const [run] = await tx
    .update(automationRuns)
    .set({ status: 'running', error: null, finishedAt: null, updatedAt: sql`now()` })
    .where(
      and(
        eq(automationRuns.orgId, orgId),
        eq(automationRuns.id, runId),
        eq(automationRuns.status, 'failed'),
      ),
    )
    .returning();

  if (run) await queueAdvance(tx, run, run.cursor, new Date(Date.now() + 1));

  return run ?? null;
};

export const cancelRun = async (tx: Db, orgId: string, runId: string) => {
  const [run] = await tx
    .update(automationRuns)
    .set({
      status: 'cancelled',
      finishedAt: sql`now()`,
      waitingUntil: null,
      waitEvent: null,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(automationRuns.orgId, orgId),
        eq(automationRuns.id, runId),
        inArray(automationRuns.status, ['running', 'waiting']),
      ),
    )
    .returning();

  return run ?? null;
};

export { subjectOf, definitionOf };
