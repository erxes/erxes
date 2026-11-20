import { z } from 'zod';
import { agentTool } from '~/modules/agents/tool';
import { CODE_LIMITS, runProgram } from '../codeMode';
import {
  CallApiInput,
  callProcedure,
  SEARCH_LIMIT,
  SEARCH_MAX,
  searchApi,
  type ToolScope,
} from './apiTools';
import { refusal } from './results';

export const CODE_MODE_INSTRUCTIONS = `Code mode is on: runCode runs a JavaScript program in a sandbox with two async functions, searchApi(query, limit) and callApi(procedure, input), which work like the tools of the same names and return their results. Use it to page through records, join and aggregate them, and compute totals, shares, deltas and scenarios, then return one JSON value; console.log lines come back too. The program has no network, files or timers, stops after ${CODE_LIMITS.timeMs / 1000} seconds or ${CODE_LIMITS.hostCalls} API calls, and returns at most ${CODE_LIMITS.outputChars} characters.`;

const PRELUDE = `
globalThis.searchApi = async (query, limit) => JSON.parse(await __host_searchApi(String(query), String(limit ?? '')));
globalThis.callApi = async (procedure, input) => JSON.parse(await __host_callApi(String(procedure), JSON.stringify(input ?? {})));
`;

const callFromProgram = async (scope: ToolScope, [procedure = '', json = '{}']: string[]) => {
  const input: unknown = JSON.parse(json);
  const parsed = CallApiInput.safeParse({ procedure, input });

  if (!parsed.success)
    return refusal('INVALID_INPUT', 'callApi takes a procedure name and an object');

  return callProcedure(scope, parsed.data.procedure, parsed.data.input);
};

export const runCode = (scope: ToolScope) =>
  agentTool({
    name: 'runCode',
    description:
      'Run a JavaScript program in a sandbox that can call searchApi and callApi, to compute over many records and return one JSON value. Write the body of an async function and return the result.',
    input: z.object({ code: z.string().min(1).max(20_000) }),
    execute: async ({ code }) => {
      if (!scope.codeMode) return refusal('CODE_MODE_OFF', 'An admin has not turned on code mode');

      return runProgram({
        code,
        prelude: PRELUDE,
        host: {
          searchApi: ([query = '', limit = '']) =>
            searchApi(scope, query, Math.min(Number(limit) || SEARCH_LIMIT, SEARCH_MAX)),
          callApi: (args) => callFromProgram(scope, args),
        },
      });
    },
  });
