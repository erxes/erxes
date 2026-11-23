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
  run: { id: string; depth: number };
  step: { id: string };
  /** The agent tool call that runs it inside an agent step, which keys its work apart from the step's. */
  call?: string;
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
export type CoreAction = ActionSpec & {
  type: string;
  /** The integration it belongs to (`qpay`): listed only while that integration is connected. */
  integration?: { key: string; name: string };
} & (
    | { run: (ctx: ActionContext) => Promise<unknown> }
    | { call: (ctx: CallContext) => Promise<unknown> }
  );

/** What an action is, apart from its type and how it runs. */
export type ActionSpec = Pick<ActionInfo, 'label' | 'description' | 'subject' | 'fields'> &
  Partial<Pick<ActionInfo, 'outputs'>> & {
    /** Problems with the step's input found when the automation is saved, beyond required fields. */
    check?: (input: Record<string, unknown>) => string[];
  };

export const idempotencyKey = (ctx: CallContext) =>
  [ctx.run.id, ctx.step.id, ...(ctx.call ? [ctx.call] : [])].join(':');

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
export const parseInput = <T>(ctx: CallContext, schema: z.ZodType<T>, single: string[] = []) =>
  checked(schema, filledInput(ctx, single));

export const filledInput = (ctx: CallContext, single: string[] = []) =>
  Object.fromEntries(
    Object.entries(ctx.input).flatMap(([key, value]) => {
      if (value === undefined || value === null || value === '') return [];

      return [[key, single.includes(key) && Array.isArray(value) ? value[0] : value]];
    }),
  );

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
  .object({
    ownerId: z.string().nullish(),
    primaryEmail: z.string().nullish(),
    primaryPhone: z.string().nullish(),
  })
  .nullish();

export const subjectFields = (ctx: CallContext) =>
  SubjectFields.safeParse(ctx.context.subject).data ?? null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A `recipients` input's addresses: the record's own email (`subject`), or those given. */
export const recipientsOf = (ctx: CallContext, key: string) => {
  const to = (text(ctx.input[key]) ?? '').trim();
  const addresses = to === 'subject' ? [subjectFields(ctx)?.primaryEmail ?? ''] : to.split(',');

  return addresses
    .map((address) => address.trim())
    .filter((address) => EMAIL.test(address))
    .slice(0, 50);
};
