import { type Caller, enterScope, withOrg } from '@erxes/core-db';
import { call, getRouter, isProcedure } from '@orpc/server';
import { z } from 'zod';
import { decideKeyCall, memberMayCall } from '~/http/access';
import { decidePluginKey } from '~/http/keyRules';
import { agentTool } from '~/modules/agents/tool';
import { coreRouter } from '~/router';
import type { InstalledPlugin } from '../plugins';
import { identitiesIn } from '../records';
import { issueReferences } from '../references.service';
import { type ApiProcedure, apiCatalog } from './apiCatalog';
import { type PluginProcedure, pluginProcedures } from './pluginDocument';
import { callPluginProcedure, callPluginRoute } from './pluginOperations';
import { bounded, describeError, refusal } from './results';

type Member = Extract<Caller, { type: 'user' }>;

export interface ToolScope {
  /** Who each call runs as, read again for each: the chat's member, or an agent's key; null once gone. */
  caller: () => Promise<Member | null>;
  orgId: string;
  /** The assistant thread its references belong to; an automation step has none. */
  threadId: string | null;
  codeMode: boolean;
  plugins: InstalledPlugin[];
  /**
   * An agent talking to a customer of one plugin's website: that plugin's website and customer
   * routes run as them, on that website.
   */
  customer?: { plugin: string; token: () => Promise<string> };
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

/** The website's and customer routes of the plugin whose website the customer is on. */
const customerProcedures = async ({ customer, plugins }: ToolScope) => {
  const owner = plugins.filter((plugin) => plugin.name === customer?.plugin);

  return owner.length
    ? [
        ...(await pluginProcedures(owner, 'website')),
        ...(await pluginProcedures(owner, 'customer')),
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

/**
 * Would the call get past the caller's role or key rules? A key reaches a plugin's routes, a
 * customer's too, only when its rules allow that plugin; the plugin checks the rest.
 */
const mayCall = (member: Member, entry: Entry) => {
  if (entry.denied) return false;

  if (!isPluginEntry(entry)) {
    return member.key
      ? decideKeyCall({ ...member, key: member.key }, entry.name).allowed
      : memberMayCall(entry.name, member);
  }

  return !member.key || decidePluginKey(member.key, entry.plugin).allowed;
};

export const searchApi = async (scope: ToolScope, query: string, limit = SEARCH_LIMIT) => {
  const tokens = tokensOf(query);
  const member = await scope.caller();

  if (!member) return { procedures: [] };

  const found = (await entriesOf(scope))
    .filter((entry) => mayCall(member, entry))
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
      input: procedure.input,
    }));

  return { procedures: found };
};

const withReferences = async (scope: ToolScope, schema: unknown, result: unknown) => {
  const identities = identitiesIn(schema, result);

  const { threadId } = scope;

  if (identities.length === 0 || threadId === null) return bounded(result);

  const issued = await withOrg(scope.orgId, (tx) => issueReferences(tx, threadId, identities));

  return bounded(
    result,
    issued.map(({ ref, type, label }) => ({ ref, type, label })),
  );
};

const runCore = async (scope: ToolScope, name: string, input: Record<string, unknown>) => {
  const path = name.split('.');
  const procedure = getRouter(coreRouter, path);

  if (!isProcedure(procedure)) return refusal('UNKNOWN_PROCEDURE', `No procedure is named ${name}`);

  return call(procedure, input, { context: {}, path }).then(
    (result) => withReferences(scope, procedure['~orpc'].outputSchema, result),
    describeError,
  );
};

export const callProcedure = async (
  scope: ToolScope,
  name: string,
  input: Record<string, unknown> = {},
) => {
  const entry = await findEntry(scope, name);

  if (!entry) return refusal('UNKNOWN_PROCEDURE', `No procedure is named ${name}; use searchApi`);

  if (entry.denied) {
    return refusal(
      'ASSISTANT_DENIED',
      `${name} is not available to the assistant (sign-in, credentials and security settings stay with people)`,
    );
  }

  const member = await scope.caller();

  if (!member) return refusal('UNAUTHORIZED', 'The member or key this acts as is no longer active');

  // Core checks its own procedures when they run; a plugin's routes are checked here.
  if (isPluginEntry(entry) && !mayCall(member, entry)) {
    return refusal('FORBIDDEN', `Your access does not include the ${entry.plugin} plugin`);
  }

  const { customer } = scope;

  const run = () => {
    if (!isPluginEntry(entry)) return runCore(scope, name, input);

    if (entry.audience !== 'member' && customer) {
      return callPluginRoute(entry, input, customer.token);
    }

    return callPluginProcedure(scope.orgId, entry, input);
  };

  const result = await enterScope(member, scope.orgId, run);

  return result.ok ? { ...result, changed: entry.changes } : result;
};

export const apiTools = (scope: ToolScope) => [
  agentTool({
    name: 'searchApi',
    description:
      'Find the erxes API procedures you can call for a task, including those of installed plugins. Search with plain words (e.g. "customers by email", "create tag"). Returns each procedure with its method, summary, description (its rules and errors) and input JSON schema.',
    input: z.object({
      query: z.string().trim().min(1).max(200),
      limit: z.int().min(1).max(SEARCH_MAX).optional(),
    }),
    execute: ({ query, limit }) => searchApi(scope, query, limit),
  }),
  agentTool({
    name: 'callApi',
    description:
      'Run one erxes API procedure with your permissions. Pass the procedure name from searchApi and one input object.',
    input: CallApiInput,
    execute: ({ procedure, input }) => callProcedure(scope, procedure, input),
  }),
];
