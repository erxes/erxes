import { WorkerEntrypoint } from 'cloudflare:workers';
import { type ErrorBody, ExtensionError, toIssues } from './errors';
import type { AnyExtension, Operation } from './server';

// Supervisor's Host entrypoint, scoped to one invocation of this extension.
// It answers with the runtime's envelope instead of throwing, because an
// error thrown across RPC loses everything but its message.
type HostResult = { ok: true; data: unknown } | { ok: false; error: ErrorBody };

type Host = {
  // One driver method on one of the extension's collections.
  db(collection: string, method: string, args: unknown[]): Promise<HostResult>;
  // One persisted GraphQL operation, by the hash codegen gave it.
  gql(hash: string, variables: unknown): Promise<HostResult>;
};

// What the extension's worker returns for one root field.
export type InvokeResult =
  | { ok: true; data: unknown }
  | { ok: false; error: ErrorBody };

// The Collection methods ctx.db forwards to the host as they were called.
// The host checks every argument; see the runtime's hostDb.ts.
const METHODS = [
  'find',
  'findOne',
  'countDocuments',
  'estimatedDocumentCount',
  'distinct',
  'insertOne',
  'insertMany',
  'updateOne',
  'updateMany',
  'replaceOne',
  'deleteOne',
  'deleteMany',
  'findOneAndUpdate',
  'findOneAndReplace',
  'findOneAndDelete',
  'bulkWrite',
  'aggregate',
];

// A failed host call throws, keeping its code and issues.
const unwrap = async (pending: Promise<HostResult>) => {
  const result = await pending;

  if (!result.ok) {
    const { code, message, issues } = result.error;
    throw new ExtensionError(code, message, issues);
  }

  return result.data;
};

const collection = (host: Host, name: string) =>
  Object.fromEntries(
    METHODS.map((method) => [
      method,
      (...args: unknown[]) => unwrap(host.db(name, method, args)),
    ]),
  );

// Sends the hash codegen put on the operation, never the document: the
// runtime runs only documents the install shipped.
const gql =
  (host: Host) =>
  async (operation: Operation<unknown, unknown>, variables?: unknown) => {
    const hash = operation.__meta__?.hash;

    if (typeof hash !== 'string') {
      throw new ExtensionError(
        'NOT_PERSISTED',
        'This operation has no hash. Run `erxes-ext codegen`.',
      );
    }

    return unwrap(host.gql(hash, variables ?? {}));
  };

const fail = (
  code: string,
  message: string,
  issues?: ErrorBody['issues'],
): InvokeResult => ({
  ok: false,
  error: { code, message, ...(issues && { issues }) },
});

// A zod parse failure, recognised by shape so the SDK doesn't bundle zod.
const isValidationError = (
  e: unknown,
): e is Error & {
  issues: { path: PropertyKey[]; message: string }[];
} => e instanceof Error && e.name === 'ZodError' && 'issues' in e;

// What a resolver threw, as the envelope. A coded error keeps its code; a
// failed zod parse is INVALID_INPUT with its issues; anything else is the
// resolver's own failure.
const fromThrown = (e: unknown): InvokeResult => {
  if (e instanceof ExtensionError) {
    return { ok: false, error: e.toJSON() };
  }

  if (isValidationError(e)) {
    const issues = toIssues(e.issues);

    return fail(
      'INVALID_INPUT',
      issues
        .map(({ path, message }) => (path ? `${path}: ${message}` : message))
        .join('; '),
      issues,
    );
  }

  return fail('FUNCTION_ERROR', e instanceof Error ? e.message : String(e));
};

// Default export of every extension bundle: `serve(extension)`. The runtime
// calls `invoke` once per root field, `Query.<field>` or `Mutation.<field>`,
// with the field's arguments and a Host stub made for this call.
export const serve = (extension: AnyExtension) =>
  class extends WorkerEntrypoint {
    async invoke(
      name: string,
      args: unknown,
      user: { _id: string },
      host: Host,
    ): Promise<InvokeResult> {
      const [type, field] = name.split('.');
      const resolver: unknown = extension.resolvers[type]?.[field];

      if (typeof resolver !== 'function') {
        return fail('UNKNOWN_FIELD', `no resolver for ${name}`);
      }

      const ctx = {
        user,
        db: Object.fromEntries(
          Object.keys(extension.collections).map((name) => [
            name,
            collection(host, name),
          ]),
        ),
        gql: gql(host),
      };

      try {
        const data: unknown = await resolver(undefined, args, ctx);
        return { ok: true, data: data ?? null };
      } catch (e) {
        return fromThrown(e);
      }
    }
  };
