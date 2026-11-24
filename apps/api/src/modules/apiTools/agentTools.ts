import { z } from 'zod';
import { agentTool } from '~/modules/agents/tool';
import { CallApiInput, callProcedure, SEARCH_MAX, searchApi, type ToolScope } from './calls';
import { PROGRAM_LIMITS, runApiProgram } from './program';

export const CODE_MODE_INSTRUCTIONS = `Code mode is on: runCode runs a JavaScript program in a sandbox with two async functions, searchApi(query, limit) and callApi(procedure, input), which work like the tools of the same names and return their results. Use it to page through records, join and aggregate them, and compute totals, shares, deltas and scenarios, then return one JSON value; console.log lines come back too. ${PROGRAM_LIMITS}`;

/** searchApi and callApi, for an agent that runs as the scope's caller. */
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

/** runCode: a program over searchApi and callApi, for compute over many records. */
export const runCode = (scope: ToolScope) =>
  agentTool({
    name: 'runCode',
    description:
      'Run a JavaScript program in a sandbox that can call searchApi and callApi, to compute over many records and return one JSON value. Write the body of an async function and return the result.',
    input: z.object({ code: z.string().min(1).max(20_000) }),
    execute: ({ code }) => runApiProgram(scope, code, 'any'),
  });
