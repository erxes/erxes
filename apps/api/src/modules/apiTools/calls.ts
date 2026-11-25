import { type Caller, enterScope } from '@erxes/core-db';
import { call, getRouter, isProcedure } from '@orpc/server';
import MiniSearch from 'minisearch';
import { z } from 'zod';
import { can, decideKeyCall, memberMayCall } from '~/http/access';
import { decidePluginKey } from '~/http/keyRules';
import { coreRouter } from '~/router';
import { type ApiProcedure, apiCatalog, needsPerson } from './catalog';
import { type PluginProcedure, pluginProcedures } from './pluginDocument';
import { callPluginProcedure, callPluginRoute } from './pluginOperations';
import type { InstalledPlugin } from './plugins';
import { bounded, describeError, type IssuedReference, type Reader, refusal } from './results';
import { signatureOf } from './signature';

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
   * An agent serving a portal's visitors: the guest routes of the plugins on the portal run with
   * the headers `credentials` gives (a portal token). When the conversation is with a customer
   * (`signedIn`), their own routes run too, as them (their token as well).
   */
  portal?: {
    plugins: string[];
    signedIn: boolean;
    credentials: () => Promise<Record<string, string>>;
  };
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

/** Words of a name or text: `hr:leaveRequests.list` gives hr, leave, requests and list. */
const tokenize = (text: string) =>
  text.replaceAll(/([a-z])([A-Z])/g, '$1 $2').split(/[^\dA-Za-z]+/);

/** Lower case and singular, so "companies" finds companies.list and "member" finds members. */
const processTerm = (term: string) =>
  term.length > 1
    ? term.toLowerCase().replace(/(ies|s)$/, (end) => (end === 'ies' ? 'y' : ''))
    : null;

/**
 * Does the query name every word of the route's own name, without its plugin
 * (`catalog.read` of `ecommerce:catalog.read`)? Such a route ranks above routes that share
 * more words but add their own, like `catalog.products.available`.
 */
const coversName = (name: string, terms: Set<string>) => {
  const words = termsOf(name.slice(name.lastIndexOf(':') + 1));

  return words.size > 0 && [...words].every((word) => terms.has(word));
};

const termsOf = (text: string) =>
  new Set(tokenize(text).flatMap((token) => processTerm(token) ?? []));

type Entry = ApiProcedure | PluginProcedure;

const isPluginEntry = (entry: Entry): entry is PluginProcedure => 'plugin' in entry;

/** The routes of the plugins on the scope's portal: guests', and a signed-in customer's own. */
const portalProcedures = async ({ portal, plugins }: ToolScope) => {
  const onPortal = plugins.filter((plugin) => portal?.plugins.includes(plugin.name));

  if (!portal || !onPortal.length) return [];

  const routes = [
    ...(await pluginProcedures(onPortal, 'portal')),
    ...(await pluginProcedures(onPortal, 'customer')),
  ];

  return portal.signedIn ? routes : routes.filter((route) => !route.signedIn);
};

/** Every route the scope reaches: core's, plugins' member routes, and its portal's. */
const entriesOf = async (scope: ToolScope): Promise<Entry[]> => [
  ...apiCatalog().values(),
  ...(await pluginProcedures(scope.plugins)),
  ...(await portalProcedures(scope)),
];

const findEntry = async (scope: ToolScope, name: string) =>
  apiCatalog().get(name) ?? (await entriesOf(scope)).find((entry) => entry.name === name);

/** Kept from every caller (credentials), or from one nobody watches (what people do themselves). */
const withheld = (scope: ToolScope, entry: Entry) =>
  entry.denied || (scope.unattended && needsPerson(entry.name));

/**
 * Would the call get past the caller's role or key rules? A plugin route that names its
 * permissions needs one of them. A key reaches a plugin's routes, a customer's too, only when
 * its rules open that plugin, and writes to it only when they open it for writing; the plugin
 * checks the rest.
 */
const mayCall = (member: Member, entry: Entry) => {
  if (!isPluginEntry(entry)) {
    return member.key
      ? decideKeyCall({ ...member, key: member.key }, entry.name).allowed
      : memberMayCall(entry.name, member);
  }

  const permitted =
    entry.permissions.length === 0 || entry.permissions.some((action) => can(member, action));

  if (!member.key) return permitted;

  return (
    permitted &&
    decidePluginKey(member.key, entry.plugin).allowed &&
    (!entry.changes || member.key.plugins[entry.plugin] === 'write')
  );
};

/**
 * The procedures the caller may run that best match plain words: a route whose whole name the
 * words cover first, then by summary, name and description, with prefixes and typos matching too. Each comes with its input as a one-line
 * signature, a fraction of its JSON schema's tokens.
 */
export const searchApi = async (scope: ToolScope, query: string, limit = SEARCH_LIMIT) => {
  const member = await scope.caller();

  if (!member) return { procedures: [] };

  const entries = (await entriesOf(scope)).filter(
    (entry) => !withheld(scope, entry) && mayCall(member, entry),
  );

  const index = new MiniSearch<Entry>({
    idField: 'name',
    fields: ['name', 'summary', 'description'],
    tokenize,
    processTerm,
  });

  index.addAll(entries);

  const byName = new Map(entries.map((entry) => [entry.name, entry]));

  const terms = termsOf(query);

  const found = index
    .search(query, { boost: { summary: 3, name: 1, description: 0.5 }, prefix: true, fuzzy: 0.2 })
    .flatMap(({ id }) => byName.get(String(id)) ?? [])
    .toSorted((a, b) => Number(coversName(b.name, terms)) - Number(coversName(a.name, terms)))
    .slice(0, limit)
    .map((entry) => ({
      procedure: entry.name,
      ...(entry.summary ? { summary: entry.summary } : {}),
      ...(entry.description ? { description: entry.description } : {}),
      changes: entry.changes,
      input: signatureOf(entry.input),
    }));

  return { procedures: found };
};

type Answer = ReturnType<typeof refusal> | { ok: true; result: unknown };

const runCore = async (
  scope: ToolScope,
  name: string,
  input: Record<string, unknown>,
  reader: Reader,
) => {
  const path = name.split('.');
  const procedure = getRouter(coreRouter, path);

  if (!isProcedure(procedure)) return refusal('UNKNOWN_PROCEDURE', `No procedure is named ${name}`);

  return call(procedure, input, { context: {}, path }).then(async (result) => {
    const schema = procedure['~orpc'].outputSchema;

    return bounded(result, (await scope.references?.(schema, result)) ?? [], reader);
  }, describeError);
};

/** What `callProcedure` lets through: anything, or only procedures that change nothing. */
export type CallKind = 'any' | 'read';

export const callProcedure = async (
  scope: ToolScope,
  name: string,
  input: Record<string, unknown> = {},
  { kind = 'any', reader = 'model' }: { kind?: CallKind; reader?: Reader } = {},
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

  const { portal } = scope;

  const run = async () => {
    if (!isPluginEntry(entry)) return runCore(scope, name, input, reader);

    const answer: Answer =
      entry.audience !== 'member' && portal
        ? await callPluginRoute(entry, input, portal.credentials)
        : await callPluginProcedure(scope.orgId, entry, input);

    return answer.ok ? bounded(answer.result, [], reader) : answer;
  };

  const result = await enterScope(member, scope.orgId, run);

  return result.ok ? { ...result, changed: entry.changes } : result;
};
