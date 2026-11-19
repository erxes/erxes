import { type Caller, enterScope, withOrg } from '@erxes/core-db';
import { call, getRouter, isProcedure } from '@orpc/server';
import { z } from 'zod';
import { memberMayCall } from '~/http/access';
import { memberOf } from '~/http/auth';
import { agentTool } from '~/modules/agents/tool';
import { coreRouter } from '~/router';
import type { InstalledPlugin } from '../plugins';
import { identitiesIn } from '../records';
import { issueReferences } from '../references.service';
import { type ApiProcedure, apiCatalog } from './apiCatalog';
import { type PluginProcedure, pluginProcedures } from './pluginDocument';
import { callPluginProcedure } from './pluginOperations';
import { bounded, describeError, refusal } from './results';

type Member = Extract<Caller, { type: 'user' }>;

export interface ToolScope {
  member: Member;
  orgId: string;
  threadId: string;
  codeMode: boolean;
  plugins: InstalledPlugin[];
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
  const summary = stemmed(procedure.summary);

  return tokens.reduce((score, token) => {
    const inName = name.includes(token) ? 3 : 0;
    const inPath = path.includes(token) ? 2 : 0;
    const inSummary = summary.includes(token) ? 1 : 0;

    return score + inName + inPath + inSummary;
  }, 0);
};

type Entry = ApiProcedure | PluginProcedure;

const isPluginEntry = (entry: Entry): entry is PluginProcedure => 'plugin' in entry;

const findEntry = async (scope: ToolScope, name: string): Promise<Entry | undefined> =>
  apiCatalog().get(name) ??
  (await pluginProcedures(scope.plugins)).find((entry) => entry.name === name);

const mayCall = (scope: ToolScope, entry: Entry) =>
  !entry.denied && (isPluginEntry(entry) || memberMayCall(entry.name, scope.member));

export const searchApi = async (scope: ToolScope, query: string, limit = SEARCH_LIMIT) => {
  const tokens = tokensOf(query);

  const found = [...apiCatalog().values(), ...(await pluginProcedures(scope.plugins))]
    .filter((entry) => mayCall(scope, entry))
    .map((procedure) => ({ procedure, score: scoreOf(procedure, tokens) }))
    .filter(({ score }) => score > 0)
    .toSorted((a, b) => b.score - a.score || a.procedure.name.localeCompare(b.procedure.name))
    .slice(0, limit)
    .map(({ procedure }) => ({
      procedure: procedure.name,
      method: procedure.method,
      path: procedure.path,
      summary: procedure.summary,
      input: procedure.input,
    }));

  return { procedures: found };
};

const withReferences = async (scope: ToolScope, schema: unknown, result: unknown) => {
  const identities = identitiesIn(schema, result);

  if (identities.length === 0) return bounded(result);

  const issued = await withOrg(scope.orgId, (tx) =>
    issueReferences(tx, scope.threadId, identities),
  );

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

  const member = await memberOf(scope.orgId, scope.member.userId);

  if (!member)
    return refusal('UNAUTHORIZED', 'The member who started this chat is no longer active');

  const result = await enterScope(member, scope.orgId, () =>
    isPluginEntry(entry)
      ? callPluginProcedure(scope.orgId, entry, input)
      : runCore(scope, name, input),
  );

  return result.ok ? { ...result, changed: entry.changes } : result;
};

export const apiTools = (scope: ToolScope) => [
  agentTool({
    name: 'searchApi',
    description:
      'Find the erxes API procedures you can call for a task, including those of installed plugins. Search with plain words (e.g. "customers by email", "create tag"). Returns each procedure with its method, summary and input JSON schema.',
    input: z.object({
      query: z.string().trim().min(1).max(200),
      limit: z.int().min(1).max(SEARCH_MAX).optional(),
    }),
    execute: ({ query, limit }) => searchApi(scope, query, limit),
  }),
  agentTool({
    name: 'callApi',
    description:
      'Run one erxes API procedure as the signed-in member, with their permissions. Pass the procedure name from searchApi and one input object.',
    input: CallApiInput,
    execute: ({ procedure, input }) => callProcedure(scope, procedure, input),
  }),
];
