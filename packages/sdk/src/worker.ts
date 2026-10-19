import { WorkerEntrypoint } from 'cloudflare:workers';
import * as z from 'zod';
import { type ErrorBody, ExtensionError, toIssues } from './errors';
import {
  collectExtension,
  type Collection,
  type Ctx,
  type Filter,
  type InvokeErrorCode,
  type InvokeResult,
} from './server';

// Supervisor's Host entrypoint, scoped to one invocation of this extension.
// It answers with the runtime's envelope instead of throwing, because an
// error thrown across RPC loses everything but its message.
type Host = {
  db(
    collection: string,
    op: string,
    args: unknown[],
  ): Promise<{ ok: true; data: unknown } | { ok: false; error: ErrorBody }>;
};

const fail = (
  code: InvokeErrorCode,
  message: string,
  issues?: ErrorBody['issues'],
): InvokeResult => ({
  ok: false,
  error: { code, message, ...(issues && { issues }) },
});

const collection = (
  host: Host,
  name: string,
  schema: z.ZodObject,
): Collection<Record<string, unknown>> => {
  const op = async <T>(method: string, ...args: unknown[]) => {
    const result = await host.db(name, method, args);

    if (!result.ok) {
      const { code, message, issues } = result.error;
      throw new ExtensionError(code, message, issues);
    }

    return result.data as T;
  };

  return {
    find: (filter: Filter = {}, options = {}) => op('find', filter, options),
    findOne: (filter) => op('findOne', filter),
    count: (filter: Filter = {}) => op('count', filter),
    insertOne: (doc) => op('insertOne', schema.parse(doc)),
    // Validate only the fields being set. `partial()` would still fill every
    // other field's default and overwrite the stored value with it.
    updateOne: (filter, set) =>
      op(
        'updateOne',
        filter,
        z
          .object(
            Object.fromEntries(
              Object.keys(set)
                .filter((key) => key in schema.shape)
                .map((key) => [key, schema.shape[key]]),
            ),
          )
          .parse(set),
      ),
    deleteOne: (filter) => op('deleteOne', filter),
  };
};

// What a handler threw, as the envelope. A coded error keeps its code; a
// failed schema parse is INVALID_INPUT with its issues; anything else is the
// handler's own failure.
const fromThrown = (e: unknown): InvokeResult => {
  if (e instanceof ExtensionError) {
    return { ok: false, error: e.toJSON() };
  }

  if (e instanceof z.ZodError) {
    return fail('INVALID_INPUT', z.prettifyError(e), toIssues(e.issues));
  }

  return fail('FUNCTION_ERROR', e instanceof Error ? e.message : String(e));
};

// Default export of every extension bundle: `serve(await import('./server'))`.
// The supervisor calls `invoke` with a Host stub made for this invocation.
export const serve = (mod: Record<string, unknown>) => {
  const { schema, functions } = collectExtension(mod);

  const context = (user: { _id: string }, host: Host): Ctx => ({
    user,
    db: Object.fromEntries(
      Object.entries(schema).map(([name, s]) => [
        name,
        collection(host, name, s),
      ]),
    ),
  });

  return class extends WorkerEntrypoint {
    async invoke(
      name: string,
      input: unknown,
      user: { _id: string },
      host: Host,
    ): Promise<InvokeResult> {
      const f = functions.get(name);

      if (!f) {
        return fail('UNKNOWN_FUNCTION', `no function ${name}`);
      }

      const parsed = f.input.safeParse(input);

      if (!parsed.success) {
        return fail(
          'INVALID_INPUT',
          z.prettifyError(parsed.error),
          toIssues(parsed.error.issues),
        );
      }

      let data: unknown;

      try {
        data = await f.handler(context(user, host), parsed.data);
      } catch (e) {
        return fromThrown(e);
      }

      if (f.output) {
        const output = f.output.safeParse(data);

        if (!output.success) {
          return fail('INVALID_OUTPUT', z.prettifyError(output.error));
        }

        data = output.data;
      }

      return { ok: true, data };
    }
  };
};
