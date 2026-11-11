import { AutomationDefinition, type AutomationStep } from '@erxes/core-contract';
import {
  automationRuns,
  automationRunSteps,
  automations,
  automationVersions,
  type Db,
  events,
  newId,
  pluginInstallations,
  roles,
  type Transaction,
  users,
} from '@erxes/core-db';
import { and, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import type { Actor } from '~/http/auth';
import { withRunCause } from '~/lib/causation';
import { log } from '~/lib/log';
import { toEventDto } from '~/modules/events/events.service';
import type { EventConsumer } from '~/modules/events/processor';
import { enqueueJob, type JobDefinition } from '~/modules/jobs/jobs';
import { CORE_ACTIONS, pluginOfAction, runPluginAction } from './actions';
import { evaluateGroup } from './conditions';
import { render } from './templates';

type RunRow = typeof automationRuns.$inferSelect;
type EventRow = typeof events.$inferSelect;

/** Automations started by events that automations caused stop this deep. */
export const MAX_CHAIN_DEPTH = 5;
/** A run that loops through steps (branches can't, but be safe) stops after this many. */
const MAX_STEPS_PER_RUN = 500;

export type Cursor = (number | string)[];

/** The step a cursor points at (`[2, "then", 0]`), or null past the end. */
export const stepAt = (steps: AutomationStep[], cursor: Cursor): AutomationStep | null => {
  let list = steps;
  let step: AutomationStep | undefined;

  for (let index = 0; index < cursor.length; index += 2) {
    step = list[cursor[index] as number];

    if (!step) return null;

    const branch = cursor[index + 1];

    if (branch !== undefined) {
      if (step.type !== 'branch') return null;
      list = branch === 'then' ? step.then : step.else;
    }
  }

  return step ?? null;
};

/** The step after `cursor`: the next in its list, else after the enclosing branch. */
export const nextCursor = (steps: AutomationStep[], cursor: Cursor): Cursor | null => {
  let current = [...cursor];

  for (;;) {
    const next = [...current.slice(0, -1), (current[current.length - 1] as number) + 1];

    if (stepAt(steps, next)) return next;
    if (current.length === 1) return null;

    // Leave the branch: continue after it.
    current = current.slice(0, -2);
  }
};

/** Into a branch's arm, or past the branch when that arm is empty. */
const enterBranch = (steps: AutomationStep[], cursor: Cursor, arm: 'then' | 'else'): Cursor | null => {
  const inside = [...cursor, arm, 0];

  return stepAt(steps, inside) ? inside : nextCursor(steps, cursor);
};

const subjectOf = async (tx: Db, orgId: string, type: string | null, id: string | null) => {
  if (!type || !id) return null;

  const table = type === 'customer' ? 'core_customers' : type === 'company' ? 'core_companies' : null;

  if (!table) return null;

  const result = await tx.execute<Record<string, unknown>>(
    sql`select * from ${sql.identifier(table)} where org_id = ${orgId} and id = ${id} limit 1`,
  );
  const row = result.rows[0];

  if (!row) return null;

  // camelCase, without internal columns: what templates and conditions read.
  const camel = Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => key !== 'org_id' && key !== 'search_text')
      .map(([key, value]) => [key.replace(/_([a-z])/g, (_m, c: string) => c.toUpperCase()), value instanceof Date ? value.toISOString() : value]),
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
    .where(and(eq(automationVersions.automationId, automationId), eq(automationVersions.version, version)))
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
    .select({ id: users.id, role: users.role, status: users.status, permissions: roles.permissions })
    .from(users)
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .where(and(eq(users.orgId, orgId), eq(users.id, userId)))
    .limit(1);

  if (!row || row.status !== 'active') throw new Error('The member who turned this automation on is no longer active');

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

const logStep = (tx: Db, run: RunRow, step: AutomationStep, entry: { status: 'succeeded' | 'failed' | 'skipped'; input?: unknown; output?: unknown; error?: string; attempt: number; startedAt: Date }) =>
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

const finish = (tx: Db, runId: string, status: 'succeeded' | 'failed' | 'cancelled', error?: string) =>
  tx
    .update(automationRuns)
    .set({ status, error: error ?? null, finishedAt: sql`now()`, waitingUntil: null, updatedAt: sql`now()` })
    .where(eq(automationRuns.id, runId));

const delayUntil = (step: Extract<AutomationStep, { type: 'delay' }>, context: Record<string, unknown>) => {
  if (step.until) {
    const rendered = render(step.until, context);
    const time = Date.parse(String(rendered));

    if (Number.isNaN(time)) throw new Error(`"${String(rendered)}" is not a date to wait until`);

    return new Date(time);
  }

  const seconds = { minutes: 60, hours: 3600, days: 86_400 }[step.unit ?? 'minutes'] * (step.amount ?? 1);

  return new Date(Date.now() + seconds * 1000);
};

/**
 * One step of a run, in the organisation's transaction together with the
 * run's progress (and the next step's job): a step is never half done. An
 * action that throws rolls everything back and the job retries; after the
 * last attempt the run fails at that step (`onDead`).
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
      .where(and(eq(automationRuns.orgId, job.orgId), eq(automationRuns.id, job.payload.runId as string)))
      .for('update')
      .limit(1);

    // Cancelled or finished meanwhile.
    if (!run || (run.status !== 'running' && run.status !== 'waiting')) return;

    const [automation] = await db.select().from(automations).where(eq(automations.id, run.automationId)).limit(1);
    const definition = automation ? await definitionOf(db, run.automationId, run.version) : null;

    if (!automation || !definition) {
      await finish(db, run.id, 'failed', 'The automation or its version is gone');
      return;
    }

    const cursor = run.cursor as Cursor;
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
    const startedAt = new Date();
    let next: Cursor | null = nextCursor(definition.steps, cursor);
    let output: unknown = null;
    let input: unknown = null;

    if (step.type === 'stop') {
      next = null;
    } else if (step.type === 'branch') {
      const matched = evaluateGroup(step.conditions, context);

      output = { matched };
      next = enterBranch(definition.steps, cursor, matched ? 'then' : 'else');
    } else if (step.type === 'delay') {
      // First time here: wait. Woken up: carry on.
      if (run.status !== 'waiting') {
        const until = delayUntil(step, context);

        if (until.getTime() > Date.now()) {
          await db
            .update(automationRuns)
            .set({ status: 'waiting', waitingUntil: until, updatedAt: sql`now()` })
            .where(eq(automationRuns.id, run.id));
          await queueAdvance(db, run, cursor, until);
          return;
        }
      }

      output = { waitedUntil: run.waitingUntil?.toISOString() ?? startedAt.toISOString() };
    } else {
      input = render(step.input, context);

      const actor = await actorOf(db, run.orgId, automation.activatedBy);
      const subject = run.subjectType && run.subjectId ? { type: run.subjectType as 'customer' | 'company', id: run.subjectId } : null;
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
        { runId: run.id, automationId: automation.id, automationName: automation.name, depth: run.depth },
        async () => {
          if (core) return core.run(ctx);

          const plugin = await pluginOfAction(db, step.action);
          const [installed] = plugin
            ? await db
                .select({ status: pluginInstallations.status })
                .from(pluginInstallations)
                .where(and(eq(pluginInstallations.orgId, run.orgId), eq(pluginInstallations.plugin, plugin.name)))
                .limit(1)
            : [];

          if (!plugin || installed?.status !== 'active' || !plugin.manifest?.actions?.some((action) => action.type === step.action)) {
            throw new Error(`No action ${step.action} (is its plugin installed?)`);
          }

          return runPluginAction(ctx, plugin, step.action);
        },
      );

      // Actions may have changed the subject: later steps see it as it is now.
      context.subject = await subjectOf(db, run.orgId, run.subjectType, run.subjectId);
    }

    context.steps = { ...((context.steps as Record<string, unknown>) ?? {}), [step.id]: { output } };
    await logStep(db, run, step, { status: 'succeeded', input, output, attempt: job.attempts, startedAt });

    if (!next) {
      await db.update(automationRuns).set({ context, cursor }).where(eq(automationRuns.id, run.id));
      await finish(db, run.id, 'succeeded');
      return;
    }

    await db
      .update(automationRuns)
      .set({ context, cursor: next, status: 'running', waitingUntil: null, updatedAt: sql`now()` })
      .where(eq(automationRuns.id, run.id));
    await queueAdvance(db, run, next);
  },
  async onDead(job, error, tx) {
    const [run] = await tx
      .select()
      .from(automationRuns)
      .where(and(eq(automationRuns.orgId, job.orgId), eq(automationRuns.id, job.payload.runId as string)))
      .limit(1);

    if (!run || (run.status !== 'running' && run.status !== 'waiting')) return;

    const definition = await definitionOf(tx, run.automationId, run.version);
    const step = definition ? stepAt(definition.steps, run.cursor as Cursor) : null;

    if (step) await logStep(tx, run, step, { status: 'failed', error, attempt: job.attempts, startedAt: new Date() });

    await finish(tx, run.id, 'failed', error);
  },
};

/**
 * The event stream → automations: each active automation of the event's
 * organisation whose trigger matches and whose conditions hold starts a run
 * (once per event). Events caused by an automation's own runs don't start it
 * again, and chains stop at depth 5.
 */
export const automationsConsumer: EventConsumer = {
  name: 'core.automations',
  async handle(tx, event: EventRow) {
    if (event.depth >= MAX_CHAIN_DEPTH) {
      log.warn('automation chain too deep; not starting more', { event: event.id, depth: event.depth });
      return;
    }

    const candidates = await tx
      .select()
      .from(automations)
      .where(and(eq(automations.orgId, event.orgId), eq(automations.status, 'active'), eq(automations.triggerEvent, event.type)));

    if (!candidates.length) return;

    const cause = event.causedByRun
      ? (await tx.select({ automationId: automationRuns.automationId }).from(automationRuns).where(eq(automationRuns.id, event.causedByRun)).limit(1))[0]
      : undefined;
    const subject = await subjectOf(tx, event.orgId, event.subjectType, event.subjectId);
    const context = { event: toEventDto(event), subject, steps: {} };

    for (const automation of candidates) {
      if (!automation.activeVersion || cause?.automationId === automation.id) continue;

      const definition = await definitionOf(tx, automation.id, automation.activeVersion);

      if (!definition || !evaluateGroup(definition.trigger.conditions, context)) continue;

      if (definition.reentry !== 'always' && event.subjectId) {
        const [earlier] = await tx
          .select({ id: automationRuns.id })
          .from(automationRuns)
          .where(
            and(
              eq(automationRuns.automationId, automation.id),
              eq(automationRuns.subjectId, event.subjectId),
              definition.reentry === 'daily' ? gt(automationRuns.startedAt, sql`now() - interval '1 day'`) : undefined,
            ),
          )
          .orderBy(desc(automationRuns.startedAt))
          .limit(1);

        if (earlier) continue;
      }

      const [run] = await tx
        .insert(automationRuns)
        .values({
          id: newId(),
          orgId: event.orgId,
          automationId: automation.id,
          version: automation.activeVersion,
          eventId: event.id,
          eventType: event.type,
          subjectType: event.subjectType,
          subjectId: event.subjectId,
          context,
          depth: event.depth,
        })
        .onConflictDoNothing()
        .returning();

      if (run) await queueAdvance(tx, run, [0]);
    }
  },
};

/** Continue a failed run at the step that failed. */
export const retryRun = async (tx: Db, orgId: string, runId: string) => {
  const [run] = await tx
    .update(automationRuns)
    .set({ status: 'running', error: null, finishedAt: null, updatedAt: sql`now()` })
    .where(and(eq(automationRuns.orgId, orgId), eq(automationRuns.id, runId), eq(automationRuns.status, 'failed')))
    .returning();

  if (run) await queueAdvance(tx, run, run.cursor as Cursor, new Date(Date.now() + 1));

  return run ?? null;
};

export const cancelRun = async (tx: Db, orgId: string, runId: string) => {
  const [run] = await tx
    .update(automationRuns)
    .set({ status: 'cancelled', finishedAt: sql`now()`, waitingUntil: null, updatedAt: sql`now()` })
    .where(and(eq(automationRuns.orgId, orgId), eq(automationRuns.id, runId), inArray(automationRuns.status, ['running', 'waiting'])))
    .returning();

  return run ?? null;
};
