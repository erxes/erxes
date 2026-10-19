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

// Hosts the extension may fetch, over https on port 443 only. A leading `*.`
// matches subdomains, not the domain itself:
//
//   export const network = defineNetwork(['api.github.com', '*.slack.com']);
//
// Without it, every fetch fails. Install refuses IPs, ports, paths, schemes
// and a bare `*`.
export const defineNetwork = (hosts: string[]) => hosts;

// Values the owner sets in Settings > Extensions, by name, each with the
// description the owner reads there. Names are upper snake case:
//
//   export const secrets = defineSecrets({
//     GITHUB_TOKEN: 'Personal access token with repo scope',
//   });
//
// Register it (`secrets: typeof secrets`) to type `ctx.secrets`.
export type Secrets = Record<string, string>;

export const defineSecrets = <const S extends Secrets>(secrets: S) => secrets;

type RegisteredSecrets = Register extends { secrets: infer S extends Secrets }
  ? S
  : Record<never, never>;

// ---- Triggers: runs nobody calls. Each names one of the extension's
// functions by path. With no caller, the run acts as the owner who installed
// the extension (an event's run acts as the user who made the change, when
// there is one), and only through the install's pinned contracts. Install
// refuses a trigger whose function doesn't exist.

// Cron schedules, five fields in UTC, at most every 5 minutes, at most 10:
//
//   export const schedules = defineSchedules({
//     digest: { cron: '0 9 * * *', function: 'digest.run' },
//   });
//
// The function gets ScheduleInput.
export type Schedules = Record<string, { cron: string; function: string }>;

export const defineSchedules = <const S extends Schedules>(schedules: S) =>
  schedules;

export type ScheduleInput = { scheduledAt: string };

// A secret this extension declared, by name.
type SecretName = Register extends { secrets: infer S extends Secrets }
  ? keyof S & string
  : string;

// Signed webhooks. Each gets a URL in Settings > Extensions,
// `/webhooks/<install key>/<name>`. The runtime checks the HMAC of the raw
// body with the named secret before anything else, and runs the function
// later, off the request:
//
//   export const webhooks = defineWebhooks({
//     github: {
//       function: 'gh.onPush',
//       signature: {
//         secret: 'GITHUB_WEBHOOK_SECRET',
//         header: 'x-hub-signature-256',
//         algorithm: 'sha256',
//         prefix: 'sha256=',
//       },
//     },
//   });
//
// The header holds `prefix` and the hex digest. The function gets
// WebhookInput.
export type Webhook = {
  function: string;
  signature: {
    secret: SecretName;
    header: string;
    algorithm: 'sha1' | 'sha256' | 'sha512';
    prefix?: string;
  };
};

export type Webhooks = Record<string, Webhook>;

export const defineWebhooks = <const W extends Webhooks>(webhooks: W) =>
  webhooks;

// Only content-type, user-agent and x-* headers, lowercased. A JSON body
// arrives parsed, anything else as text.
export type WebhookInput = { headers: Record<string, string>; body: unknown };

// Record events from erxes: `<plugin>:<module>.<collection>.<action>`, where
// action is create, update or delete, e.g. 'sales:sales.deals.update'.
// `updatedFields` keeps only updates that changed one of those top-level
// fields:
//
//   export const events = defineEvents({
//     dealMoved: {
//       on: 'sales:sales.deals.update',
//       updatedFields: ['stageId'],
//       function: 'deals.onMove',
//     },
//   });
//
// The function gets EventInput: ids, never the record. Read it through a
// pinned contract, so the plugin checks the run's permissions. Delivery is
// best effort: an event erxes fails to publish is lost.
export type Events = Record<
  string,
  { on: string; updatedFields?: string[]; function: string }
>;

export const defineEvents = <const E extends Events>(events: E) => events;

export type EventInput = {
  type: string;
  _id: string;
  updatedFields?: string[];
  // The user who made the change, when erxes knows one.
  userId?: string;
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

// Indexes on the extension's own collections, created when a version is
// activated. Keys are top-level fields, ascending (1) or descending (-1). A
// unique index makes a write that would duplicate its keys fail with CONFLICT:
//
//   export const indexes = defineIndexes({
//     followUps: [{ keys: { dealId: 1 }, unique: true }],
//   });
export type Index<T> = {
  keys: { [F in keyof T & string]?: 1 | -1 };
  unique?: boolean;
};

export type Indexes = Record<
  string,
  { keys: Record<string, 1 | -1>; unique?: boolean }[]
>;

export const defineIndexes = (indexes: {
  [K in keyof RegisteredSchema]?: Index<z.output<RegisteredSchema[K]>>[];
}) => indexes;

// With `upsert: true`, `set` is the whole document: it's inserted when the
// filter matches nothing, so every top-level field of the filter must be one
// `set` also sets.
type UpdateOptions = { upsert?: boolean };
type Upsert = { upsert: true };

export type Collection<T> = {
  find(
    filter?: Filter,
    options?: { sort?: Record<string, 1 | -1>; skip?: number; limit?: number },
  ): Promise<Stored<T>[]>;
  findOne(filter: Filter): Promise<Stored<T> | null>;
  count(filter?: Filter): Promise<number>;
  insertOne(doc: T): Promise<Stored<T>>;
  // $set only. Returns the updated document, or null when nothing matched.
  // A write a unique index refuses fails with CONFLICT.
  updateOne<O extends UpdateOptions = Record<never, never>>(
    filter: Filter,
    set: O extends Upsert ? T : Partial<T>,
    options?: O,
  ): Promise<O extends Upsert ? Stored<T> : Stored<T> | null>;
  deleteOne(filter: Filter): Promise<Stored<T> | null>;
};

// Everything runs as `user`: the caller, who passed the function's
// permission check, or for a trigger the user the run acts as.
export type Ctx = {
  user: { _id: string };
  db: {
    [K in keyof RegisteredSchema]: Collection<z.output<RegisteredSchema[K]>>;
  };
  erxes: Erxes;
  // Undefined until the owner sets the value.
  secrets: { readonly [K in keyof RegisteredSecrets]: string | undefined };
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

const MANIFEST_EXPORTS = [
  'schema',
  'permissions',
  'uses',
  'indexes',
  'network',
  'secrets',
  'schedules',
  'webhooks',
  'events',
  'default',
];

// Reads an extension's server barrel: `schema`, `permissions`, `uses`,
// `indexes`, `network`, `secrets`, `schedules`, `webhooks`, `events`, plus
// one namespace per file (`export * as agents from './agents'`). A
// function's name is its path, `agents.list`.
export const collectExtension = (mod: Record<string, unknown>) => {
  const functions = new Map<string, ExtensionFunction>();

  for (const [name, value] of Object.entries(mod)) {
    if (MANIFEST_EXPORTS.includes(name)) {
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
  const indexes = (mod.indexes ?? {}) as Indexes;
  const network = (mod.network ?? []) as string[];
  const secrets = (mod.secrets ?? {}) as Secrets;
  const schedules = (mod.schedules ?? {}) as Schedules;
  const webhooks = (mod.webhooks ?? {}) as Webhooks;
  const events = (mod.events ?? {}) as Events;

  return {
    schema,
    permissions,
    uses,
    indexes,
    network,
    secrets,
    schedules,
    webhooks,
    events,
    functions,
  };
};
