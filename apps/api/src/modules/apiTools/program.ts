import { CODE_LIMITS, type ProgramGate, runProgram } from './codeMode';
import {
  CallApiInput,
  type CallKind,
  callProcedure,
  SEARCH_LIMIT,
  SEARCH_MAX,
  searchApi,
  type ToolScope,
} from './calls';
import { refusal } from './results';

export const PROGRAM_LIMITS = `The program has no network, files or timers, stops after ${CODE_LIMITS.timeMs / 1000} seconds or ${CODE_LIMITS.hostCalls} API calls, and returns at most ${CODE_LIMITS.outputChars} characters.`;

const PRELUDE = `
globalThis.searchApi = async (query, limit) => JSON.parse(await __host_searchApi(String(query), String(limit ?? '')));
globalThis.callApi = async (procedure, input) => JSON.parse(await __host_callApi(String(procedure), JSON.stringify(input ?? {})));
`;

const callFromProgram = async (
  scope: ToolScope,
  kind: CallKind,
  [procedure = '', json = '{}']: string[],
) => {
  const input: unknown = JSON.parse(json);
  const parsed = CallApiInput.safeParse({ procedure, input });

  if (!parsed.success)
    return refusal('INVALID_INPUT', 'callApi takes a procedure name and an object');

  return callProcedure(scope, parsed.data.procedure, parsed.data.input, {
    kind,
    reader: 'program',
  });
};

/**
 * Runs a program that calls `searchApi(query, limit)` and `callApi(procedure, input)` as the
 * scope's caller; with `kind` 'read', `callApi` runs only procedures that change nothing.
 */
export const runApiProgram = (
  scope: ToolScope,
  code: string,
  { kind, gate }: { kind: CallKind; gate: ProgramGate },
) =>
  runProgram(
    {
      code,
      prelude: PRELUDE,
      host: {
        searchApi: ([query = '', limit = '']) =>
          searchApi(scope, query, Math.min(Number(limit) || SEARCH_LIMIT, SEARCH_MAX)),
        callApi: (args) => callFromProgram(scope, kind, args),
      },
    },
    gate,
  );
