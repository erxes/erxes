import { type Caller, enterScope, withOrg } from '@erxes/core-db';
import { call, getRouter, isProcedure } from '@orpc/server';
import { tool } from 'ai';
import { z } from 'zod';
import { memberMayCall } from '~/http/access';
import { memberOf } from '~/http/auth';
import type { CoreContext } from '~/orpc';
import { coreRouter } from '~/router';
import type { InstalledPlugin } from '../plugins';
import { identitiesIn } from '../records';
import { issueReferences } from '../references.service';
import type { ApprovalMode } from '../settings.service';
import { type ApiProcedure, apiCatalog, needsApproval } from './apiCatalog';
import { callPluginProcedure, type PluginProcedure, pluginProcedures } from './pluginOperations';
import { bounded, describeError, refusal } from './results';

type Member = Extract<Caller, { type: 'user' }>;

export interface ToolScope {
  member: Member;
  orgId: string;
  threadId: string;
  context: CoreContext;
  approvalMode: ApprovalMode;
  codeMode: boolean;
  plugins: InstalledPlugin[];
}

const SEARCH_LIMIT = 8;

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
});

export type CallApiInput = z.infer<typeof CallApiInput>;

const tokensOf = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1)
    .map((token) => token.replace(/(ies|s)$/, (end) => (end === 'ies' ? 'y' : '')));

const scoreOf = (procedure: ApiProcedure, tokens: string[]) =>
  tokens.reduce((score, token) => {
    const inName = procedure.name.toLowerCase().includes(token) ? 3 : 0;
    const inPath = procedure.path.toLowerCase().includes(token) ? 2 : 0;
    const inSummary = procedure.summary.toLowerCase().includes(token) ? 1 : 0;

    return score + inName + inPath + inSummary;
  }, 0);

type Entry = ApiProcedure | PluginProcedure;

const isPluginEntry = (entry: Entry): entry is PluginProcedure => 'plugin' in entry;

const findEntry = (scope: ToolScope, name: string): Entry | undefined =>
  apiCatalog().get(name) ?? pluginProcedures(scope.plugins).find((entry) => entry.name === name);

const mayCall = (scope: ToolScope, entry: Entry) =>
  !entry.denied && (isPluginEntry(entry) || memberMayCall(entry.name, scope.member));

const searchProcedures = (scope: ToolScope, query: string, limit: number) => {
  const tokens = tokensOf(query);

  const found = [...apiCatalog().values(), ...pluginProcedures(scope.plugins)]
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
      needsApproval: needsApproval(procedure, scope.approvalMode),
      input: procedure.input,
    }));

  return { procedures: found };
};

const withReferences = async (scope: ToolScope, schema: unknown, result: unknown) => {
  const issued = await withOrg(scope.orgId, (tx) =>
    issueReferences(tx, scope.threadId, identitiesIn(schema, result)),
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

  return call(procedure, input, { context: scope.context, path }).then(
    (result) => withReferences(scope, procedure['~orpc'].outputSchema, result),
    describeError,
  );
};

export const callProcedure = async (
  scope: ToolScope,
  name: string,
  input: Record<string, unknown> = {},
) => {
  const entry = findEntry(scope, name);

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

  return enterScope(member, scope.orgId, () =>
    isPluginEntry(entry)
      ? callPluginProcedure(scope.orgId, entry, input)
      : runCore(scope, name, input),
  );
};

export const approvalFor = (scope: ToolScope, input: CallApiInput) => {
  const entry = findEntry(scope, input.procedure);

  if (!entry || !mayCall(scope, entry)) return 'not-applicable';

  return needsApproval(entry, scope.approvalMode) ? 'user-approval' : 'not-applicable';
};

export const searchApi = (scope: ToolScope, query: string, limit = SEARCH_LIMIT) =>
  searchProcedures(scope, query, limit);

export const apiTools = (scope: ToolScope) => ({
  searchApi: tool({
    description:
      'Find the erxes API procedures you can call for a task, including those of installed plugins. Search with plain words (e.g. "customers by email", "create tag"). Returns each procedure with its method, summary and input JSON schema.',
    inputSchema: z.object({
      query: z.string().trim().min(1).max(200),
      limit: z.int().min(1).max(20).optional(),
    }),
    execute: ({ query, limit }) => searchApi(scope, query, limit),
  }),
  callApi: tool({
    description:
      'Run one erxes API procedure as the signed-in member, with their permissions. Pass the procedure name from searchApi and one input object.',
    inputSchema: CallApiInput,
    execute: ({ procedure, input }) => callProcedure(scope, procedure, input),
  }),
});
