import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import {
  CallApiInput,
  callProcedure,
  SEARCH_MAX,
  searchApi,
  type ToolScope,
} from '~/modules/apiTools/calls';
import { programGate } from '~/modules/apiTools/codeMode';
import { PROGRAM_LIMITS, runApiProgram } from '~/modules/apiTools/program';

/** MCP clients' programs: they never hold up the assistant's. */
const gate = programGate();

const INSTRUCTIONS = `erxes is the organisation's business workspace: contacts, products, automations, broadcasts and what each installed plugin adds. You act as the member who connected you, with their permissions.

Find procedures with search, in plain words. Run one with read when it changes nothing, and with write when it does; a write asks the member first. Pass one input object with path, query and body fields together, as the procedure's input schema says. Lists take a limit and return a cursor page with totalCount: ask for what you need, with filters. Sign-in and credentials stay with people.`;

const Search = z.object({
  query: z.string().trim().min(1).max(200).describe('Plain words, e.g. "customers by email"'),
  limit: z.int().min(1).max(SEARCH_MAX).optional(),
});

const Call = CallApiInput.omit({ title: true });

const Execute = z.object({
  code: z
    .string()
    .min(1)
    .max(20_000)
    .describe('The body of an async function; return one JSON value'),
});

const Refusal = z.object({ ok: z.literal(false) });

/** A tool's answer: its JSON as text, an error when core or the plugin refused. */
const answer = (result: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(result) ?? 'null' }],
  isError: Refusal.safeParse(result).success,
});

/**
 * The tools one request's caller gets: search, read, write and, when the organisation turned on
 * code mode, execute. A program only reads, so every change goes through write, which the client
 * asks its member to approve.
 */
export const mcpServer = (scope: ToolScope, codeMode: boolean) => {
  const server = new McpServer({ name: 'erxes', version: '1.0.0' }, { instructions: INSTRUCTIONS });

  server.registerTool(
    'search',
    {
      title: 'Search the erxes API',
      description:
        "Find the procedures you can call, core's and installed plugins'. Returns each with its method, summary, description (its rules and errors), whether it changes data, and its input JSON schema.",
      inputSchema: Search,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, limit }) => answer(await searchApi(scope, query, limit)),
  );

  server.registerTool(
    'read',
    {
      title: 'Read from erxes',
      description:
        'Run a procedure that changes nothing (changes: false in search), with your permissions.',
      inputSchema: Call,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ procedure, input }) => answer(await callProcedure(scope, procedure, input, 'read')),
  );

  server.registerTool(
    'write',
    {
      title: 'Change erxes',
      description:
        'Run a procedure that changes data (changes: true in search), with your permissions.',
      inputSchema: Call,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async ({ procedure, input }) => answer(await callProcedure(scope, procedure, input)),
  );

  if (codeMode) {
    server.registerTool(
      'execute',
      {
        title: 'Run a program over erxes',
        description: `Run a JavaScript program with two async functions, searchApi(query, limit) and callApi(procedure, input), to page through records, join and aggregate them, and return one JSON value; console.log lines come back too. callApi only reads here: make changes with write. ${PROGRAM_LIMITS}`,
        inputSchema: Execute,
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async ({ code }) => answer(await runApiProgram(scope, code, { kind: 'read', gate })),
    );
  }

  return server;
};
