import { type Caller, enterScope } from '@erxes/core-db';
import { call, getRouter, isProcedure } from '@orpc/server';
import { z } from 'zod';
import { decideKeyCall, memberMayCall } from '~/http/access';
import { decidePluginKey } from '~/http/keyRules';
import { coreRouter } from '~/router';
import { type ApiProcedure, apiCatalog, needsPerson } from './catalog';
import { type PluginProcedure, pluginProcedures } from './pluginDocument';
import { callPluginProcedure, callPluginRoute } from './pluginOperations';
import type { InstalledPlugin } from './plugins';
import { bounded, describeError, type IssuedReference, refusal } from './results';

type Member = Extract<Caller, { type: 'user' }>;

export interface ToolScope {
  /** Who each call runs as, read again for each: a member, or an agent's key; null once gone. */
  caller: () => Promise<Member | null>;
  orgId: string;
  /**
   * Nobody approves each write, as in the assistant and made agents: what people do themselves
   * (sending, access, security settings) stays out. An MCP client asks its human for each write.
   */
  unattended: boolean;
  plugins: InstalledPlugin[];
  /** Turns the records in a result into references the reader can open; the assistant's chat. */
  references?: (schema: unknown, result: unknown) => Promise<IssuedReference[]>;
  /**
   * An agent talking to a customer of a portal: the portal and customer routes of the plugins
   * on it run as them, with the headers `credentials` gives (their token and a portal token).
   */
  customer?: { plugins: string[]; credentials: () => Promise<Record<string, string>> };
}

export const SEARCH_LIMIT = 8;

export const SEARCH_MAX = 20;

export const CallApiInput = z.object({
  procedure: z
    .string()
    .min(3)
    .max(130)
    .describe('The procedure name from searchApi, e.g. "customers.list" or "hr:leave.list"'),
  input: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('One object: path parameters, query and body fields together'),
  title: z
    .string()
    .trim()
    .optional()
    .describe(
      'What this call does, in a few plain words the member reads in the chat, e.g. "Find customers with a .mn email" or "Tag 3 customers VIP". Always give it.',
    ),
});

export type CallApiInput = z.infer<typeof CallApiInput>;

const tokensOf = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1)
    .map((token) => token.replace(/(ies|s)$/, (end) => (end === 'ies' ? 'y' : '')));

const stemmed = (text: string) => tokensOf(text).join(' ');

const scoreOf = (procedure: ApiProcedure, tokens: string[]) => {
  const name = stemmed(procedure.name);
  const path = stemmed(procedure.path);
  const summary = stemmed(`${procedure.summary} ${procedure.description}`);

  return tokens.reduce((score, token) => {
    const inName = name.includes(token) ? 3 : 0;
    const inPath = path.includes(token) ? 2 : 0;
    const inSummary = summary.includes(token) ? 1 : 0;

    return score + inName + inPath + inSummary;
  }, 0);
};

type Entry = ApiProcedure | PluginProcedure;

const isPluginEntry = (entry: Entry): entry is PluginProcedure => 'plugin' in entry;

/** The portal and customer routes of the plugins on the customer's portal. */
const customerProcedures = async ({ customer, plugins }: ToolScope) => {
  const onPortal = plugins.filter((plugin) => customer?.plugins.includes(plugin.name));

  return onPortal.length
    ? [
        ...(await pluginProcedures(onPortal, 'portal')),
        ...(await pluginProcedures(onPortal, 'customer')),
      ]
    : [];
};

/** Every route the scope reaches: core's, plugins' member routes, and a customer's when it has one. */
const entriesOf = async (scope: ToolScope): Promise<Entry[]> => [
  ...apiCatalog().values(),
  ...(await pluginProcedures(scope.plugins)),
  ...(await customerProcedures(scope)),
];

const findEntry = async (scope: ToolScope, name: string) =>
  apiCatalog().get(name) ?? (await entriesOf(scope)).find((entry) => entry.name === name);

/** Kept from every caller (credentials), or from one nobody watches (what people do themselves). */
const withheld = (scope: ToolScope, entry: Entry) =>
  entry.denied || (scope.unattended && needsPerson(entry.name));

/**
 * Would the call get past the caller's role or key rules? A key reaches a plugin's routes, a
 * customer's too, only when its rules open that plugin, and writes to it only when they open it
 * for writing; the plugin checks the rest.
 */
const mayCall = (member: Member, entry: Entry) => {
  if (!isPluginEntry(entry)) {
    return member.key
      ? decideKeyCall({ ...member, key: member.key }, entry.name).allowed
      : memberMayCall(entry.name, member);
  }

  if (!member.key) return true;

  return (
    decidePluginKey(member.key, entry.plugin).allowed &&
    (!entry.changes || member.key.plugins[entry.plugin] === 'write')
  );
};

export const searchApi = async (scope: ToolScope, query: string, limit = SEARCH_LIMIT) => {
  const tokens = tokensOf(query);
  const member = await scope.caller();

  if (!member) return { procedures: [] };

  const found = (await entriesOf(scope))
    .filter((entry) => !withheld(scope, entry) && mayCall(member, entry))
    .map((procedure) => ({ procedure, score: scoreOf(procedure, tokens) }))
    .filter(({ score }) => score > 0)
    .toSorted((a, b) => b.score - a.score || a.procedure.name.localeCompare(b.procedure.name))
    .slice(0, limit)
    .map(({ procedure }) => ({
      procedure: procedure.name,
      method: procedure.method,
      path: procedure.path,
      summary: procedure.summary,
      description: procedure.description,
      changes: procedure.changes,
      input: procedure.input,
    }));

  return { procedures: found };
};

const withReferences = async (scope: ToolScope, schema: unknown, result: unknown) =>
  bounded(result, (await scope.references?.(schema, result)) ?? []);

const runCore = async (scope: ToolScope, name: string, input: Record<string, unknown>) => {
  const path = name.split('.');
  const procedure = getRouter(coreRouter, path);

  if (!isProcedure(procedure)) return refusal('UNKNOWN_PROCEDURE', `No procedure is named ${name}`);

  return call(procedure, input, { context: {}, path }).then(
    (result) => withReferences(scope, procedure['~orpc'].outputSchema, result),
    describeError,
  );
};

/** What `callProcedure` lets through: anything, or only procedures that change nothing. */
export type CallKind = 'any' | 'read';

export const callProcedure = async (
  scope: ToolScope,
  name: string,
  input: Record<string, unknown> = {},
  kind: CallKind = 'any',
) => {
  const entry = await findEntry(scope, name);

  if (!entry) return refusal('UNKNOWN_PROCEDURE', `No procedure is named ${name}; use searchApi`);

  if (withheld(scope, entry)) {
    return refusal(
      'DENIED',
      entry.denied
        ? `${name} is not available to agents: sign-in and credentials stay with people`
        : `${name} is not available here: a person does it in erxes`,
    );
  }

  if (kind === 'read' && entry.changes) {
    return refusal('CHANGES_DATA', `${name} changes data; call it as a write`);
  }

  const member = await scope.caller();

  if (!member) return refusal('UNAUTHORIZED', 'The member or key this acts as is no longer active');

  // Core checks its own procedures when they run; a plugin's routes are checked here.
  if (isPluginEntry(entry) && !mayCall(member, entry)) {
    return refusal('FORBIDDEN', `Your access does not include this ${entry.plugin} route`);
  }

  const { customer } = scope;

  const run = () => {
    if (!isPluginEntry(entry)) return runCore(scope, name, input);

    if (entry.audience !== 'member' && customer) {
      return callPluginRoute(entry, input, customer.credentials);
    }

    return callPluginProcedure(scope.orgId, entry, input);
  };

  const result = await enterScope(member, scope.orgId, run);

  return result.ok ? { ...result, changed: entry.changes } : result;
};
