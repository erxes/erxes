import type { ActionInfo } from '@erxes/core-contract';
import type { ContentType, Db } from '@erxes/core-db';
import { z } from 'zod';
import { fail } from '~/http/errors';
import type { RunContext, SubjectRef } from '../runs';

/**
 * What an action that reaches another system gets: no transaction. Every
 * action runs as the member who turned the automation on (`caller('user')`),
 * so their permissions apply.
 */
export interface CallContext {
  orgId: string;
  automation: { id: string; name: string };
  run: { id: string };
  step: { id: string };
  subject: SubjectRef | null;
  /** The step's input with its placeholders filled. */
  input: Record<string, unknown>;
  /** The run's context: the event, the subject, earlier steps' outputs. */
  context: RunContext;
}

/** What an action that changes core's data gets: the step's transaction. */
export interface ActionContext extends CallContext {
  tx: Db;
}

/**
 * A core action. `run` changes core's data inside the step's transaction, so
 * the change and the run's progress commit together. `call` reaches another
 * system: it runs outside any transaction, may run more than once, and sends
 * `idempotencyKey(ctx)` so the other side does the work once.
 */
export type CoreAction = Omit<ActionInfo, 'source'> &
  (
    | { run: (ctx: ActionContext) => Promise<unknown> }
    | { call: (ctx: CallContext) => Promise<unknown> }
  );

export const idempotencyKey = (ctx: CallContext) => `${ctx.run.id}:${ctx.step.id}`;

export const needSubject = (ctx: CallContext, type: ContentType) => {
  if (ctx.subject?.type !== type) {
    throw fail('NO_SUBJECT', `This step needs a ${type}: the trigger event isn't about one`);
  }

  return ctx.subject.id;
};

/** A filled-in value as text: numbers and booleans written out, objects as JSON. */
export const text = (value: unknown) => {
  if (value === null || value === undefined) return undefined;

  if (typeof value === 'string') return value;

  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  return JSON.stringify(value);
};

/** One value or a list of them (a members or tags picker) as a list of text. */
export const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap((item) => text(item) ?? []);

  const one = text(value);

  return one ? [one] : [];
};

/**
 * The step's input for `schema` (which drops fields it doesn't declare):
 * empty values left out, and a members picker's list read as its first member.
 */
export const parseInput = <T>(ctx: CallContext, schema: z.ZodType<T>, single: string[] = []) => {
  const filled = Object.fromEntries(
    Object.entries(ctx.input).flatMap(([key, value]) => {
      if (value === undefined || value === null || value === '') return [];

      return [[key, single.includes(key) && Array.isArray(value) ? value[0] : value]];
    }),
  );

  return checked(schema, filled);
};

/** `value` parsed by `schema`, or the step fails with what was wrong. */
export const checked = <T>(schema: z.ZodType<T>, value: unknown): T => {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw fail(
      'INVALID_STEP_INPUT',
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
    );
  }

  return parsed.data;
};

/** A remote's answer: its JSON, or the text when it isn't JSON. */
export const parseBody = (body: string) => {
  try {
    return z.json().parse(JSON.parse(body));
  } catch {
    return body;
  }
};

/** The subject's fields some actions read (its owner, its email). */
const SubjectFields = z
  .object({ ownerId: z.string().nullish(), primaryEmail: z.string().nullish() })
  .nullish();

export const subjectFields = (ctx: CallContext) =>
  SubjectFields.safeParse(ctx.context.subject).data ?? null;
