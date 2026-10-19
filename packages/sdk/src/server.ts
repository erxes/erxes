import type * as z from 'zod';
import type { ContractClient, Contracts, Uses } from './contracts';
import type { ErrorBody } from './errors';

export { ExtensionError } from './errors';

// An extension registers its schema and permissions here, so `ctx.db` and
// each function's `permission` are typed without a builder:
//
//   declare module 'erxes-sdk/server' {
//     interface Register { schema: typeof schema; permissions: typeof permissions }
//   }
// Empty on purpose: declaration merging fills it.
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
export interface Register {}

export type Schema = Record<string, z.ZodObject>;

type RegisteredSchema = Register extends { schema: infer S extends Schema }
  ? S
  : Schema;

// Permission actions by module, each with the title shown in Settings >
// Permissions. They join core's permission groups like a plugin's.
export type Permissions = Record<string, Record<string, string>>;

export const definePermissions = <P extends Permissions>(permissions: P) =>
  permissions;

// `module.action`, from the registered permissions.
type PermissionName = Register extends {
  permissions: infer P extends Permissions;
}
  ? { [M in keyof P & string]: `${M}.${keyof P[M] & string}` }[keyof P & string]
  : string;

// The host contracts the extension calls, each pinned to one version:
//
//   export const uses = defineUses({ sales: 1 });
//
// Register it next to the schema (`uses: typeof uses`) to type `ctx.erxes`.
// A call to a host or version the install didn't pin fails with NOT_GRANTED.
export const defineUses = <const U extends Uses>(uses: U) => uses;

type RegisteredUses = Register extends { uses: infer U extends Uses }
  ? U
  : Record<never, never>;

// `ctx.erxes.sales.deals.get({ _id })`, typed from the pinned contracts.
export type Erxes = {
  [H in keyof RegisteredUses & keyof Contracts]: ContractClient<
    Contracts[H][RegisteredUses[H] & keyof Contracts[H]]
  >;
};

// Every function names the action a caller needs. 'public' means any
// signed-in user.
export type Permission = PermissionName | 'public';

// Collections the extension owns, stored per tenant as `ext.<id>.<name>`.
// The worker validates every insert against the schema, and every update
// against the schemas of the fields it sets. Refinements across fields (start
// before end) aren't checked on partial updates: check them in the handler.
export const defineSchema = <S extends Schema>(schema: S) => schema;

// A document as stored: the extension's own fields plus the ids and
// timestamps the host adds.
export type Stored<T> = T & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Mongo filter on an extension collection. Plain JSON, so regexes are
// written as { $regex, $options }.
export type Filter = Record<string, unknown>;

export type Collection<T> = {
  find(
    filter?: Filter,
    options?: { sort?: Record<string, 1 | -1>; skip?: number; limit?: number },
  ): Promise<Stored<T>[]>;
  findOne(filter: Filter): Promise<Stored<T> | null>;
  count(filter?: Filter): Promise<number>;
  insertOne(doc: T): Promise<Stored<T>>;
  // $set only. Returns the updated document, or null when nothing matched.
  updateOne(filter: Filter, set: Partial<T>): Promise<Stored<T> | null>;
  deleteOne(filter: Filter): Promise<Stored<T> | null>;
};

// Everything runs as `user`, who passed the function's permission check.
export type Ctx = {
  user: { _id: string };
  db: {
    [K in keyof RegisteredSchema]: Collection<z.output<RegisteredSchema[K]>>;
  };
  erxes: Erxes;
};

export type FunctionKind = 'query' | 'mutation';

export type ExtensionFunction<
  K extends FunctionKind = FunctionKind,
  I extends z.ZodType = z.ZodType,
  R = unknown,
> = {
  kind: K;
  permission: Permission;
  input: I;
  // Optional. When set, the worker validates what the handler returns.
  output?: z.ZodType;
  handler(ctx: Ctx, input: z.output<I>): Promise<R>;
};

const define =
  <K extends FunctionKind>(kind: K) =>
  <I extends z.ZodType, R>(def: {
    permission: Permission;
    input: I;
    output?: z.ZodType<R>;
    handler: (ctx: Ctx, input: z.output<I>) => Promise<R>;
  }): ExtensionFunction<K, I, R> => ({ ...def, kind });

// Reads. The browser's `useQuery` refetches them after any mutation.
export const query = define('query');
export const mutation = define('mutation');

// Codes the worker itself produces. Codes from the host's db and from an
// ExtensionError a handler throws pass through unchanged.
export type InvokeErrorCode =
  | 'UNKNOWN_FUNCTION'
  | 'INVALID_INPUT'
  | 'FUNCTION_ERROR'
  | 'INVALID_OUTPUT';

// What the extension's worker returns for one function call.
export type InvokeResult =
  | { ok: true; data: unknown }
  | { ok: false; error: ErrorBody };

const isFunction = (value: unknown): value is ExtensionFunction =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  (value.kind === 'query' || value.kind === 'mutation');

// Reads an extension's server barrel: `schema`, `permissions`, `uses`, plus one namespace per file
// (`export * as agents from './agents'`). A function's name is its path,
// `agents.list`.
export const collectExtension = (mod: Record<string, unknown>) => {
  const functions = new Map<string, ExtensionFunction>();

  for (const [name, value] of Object.entries(mod)) {
    if (
      name === 'schema' ||
      name === 'permissions' ||
      name === 'uses' ||
      name === 'default'
    ) {
      continue;
    }

    if (isFunction(value)) {
      functions.set(name, value);
    } else if (typeof value === 'object' && value !== null) {
      for (const [fn, member] of Object.entries(value)) {
        if (isFunction(member)) {
          functions.set(`${name}.${fn}`, member);
        }
      }
    }
  }

  const schema = (mod.schema ?? {}) as Schema;
  const permissions = (mod.permissions ?? {}) as Permissions;
  const uses = (mod.uses ?? {}) as Record<string, number>;

  return { schema, permissions, uses, functions };
};
