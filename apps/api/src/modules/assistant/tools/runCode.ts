import { tool } from 'ai';
import { z } from 'zod';
import { CODE_LIMITS, type ProgramResult, runProgram } from '../codeMode';
import { approvalFor, CallApiInput, callProcedure, searchApi, type ToolScope } from './apiTools';
import { refusal } from './results';

export const CODE_MODE_INSTRUCTIONS = `Code mode is on: runCode runs a JavaScript program in a sandbox with two async functions, searchApi(query, limit) and callApi(procedure, input), which work like the tools of the same names and return their results. Use it to page through records, join and aggregate them, and compute totals, shares, deltas and scenarios, then return one JSON value; console.log lines come back too. The program has no network, files or timers, stops after ${CODE_LIMITS.timeMs / 1000} seconds or ${CODE_LIMITS.hostCalls} API calls, and returns at most ${CODE_LIMITS.outputChars} characters. Changes that need the member's approval are refused inside a program: make those with callApi in the chat.`;

const callFromProgram = async (scope: ToolScope, [procedure = '', json = '{}']: string[]) => {
  const input: unknown = JSON.parse(json);
  const parsed = CallApiInput.safeParse({ procedure, input });

  if (!parsed.success)
    return refusal('INVALID_INPUT', 'callApi takes a procedure name and an object');

  if (approvalFor(scope, parsed.data) === 'user-approval') {
    return refusal(
      'APPROVAL_REQUIRED',
      `${procedure} needs the member's approval: call it with callApi in the chat, not in a program`,
    );
  }

  return callProcedure(scope, parsed.data.procedure, parsed.data.input);
};

export const runCode = (scope: ToolScope) =>
  tool({
    description:
      'Run a JavaScript program in a sandbox that can call searchApi and callApi, to compute over many records and return one JSON value. Write the body of an async function and return the result.',
    inputSchema: z.object({ code: z.string().min(1).max(20_000) }),
    execute: async ({ code }): Promise<ProgramResult | ReturnType<typeof refusal>> => {
      if (!scope.codeMode) return refusal('CODE_MODE_OFF', 'An admin has not turned on code mode');

      return runProgram(code, {
        searchApi: ([query = '', limit = '']) =>
          Promise.resolve(searchApi(scope, query, Math.min(Number(limit) || 8, 20))),
        callApi: (args) => callFromProgram(scope, args),
      });
    },
  });
