import variant from '@jitl/quickjs-wasmfile-release-sync';
import {
  newQuickJSWASMModuleFromVariant,
  type QuickJSContext,
  type QuickJSDeferredPromise,
  type QuickJSHandle,
  type QuickJSRuntime,
  type QuickJSWASMModule,
  shouldInterruptAfterDeadline,
} from 'quickjs-emscripten-core';
import { setTimeout as sleep } from 'node:timers/promises';
import { logger } from '~/logger';

export const CODE_LIMITS = {
  timeMs: 10_000,
  memoryBytes: 32 * 1024 * 1024,
  stackBytes: 512 * 1024,
  outputChars: 20_000,
  hostCalls: 50,
};

export type HostFunction = (args: string[]) => Promise<unknown>;

export type ProgramResult =
  | { ok: true; result: unknown; truncated?: true; note?: string; logs?: string[] }
  | { ok: false; code: 'TIMEOUT' | 'OUT_OF_MEMORY' | 'PROGRAM_ERROR'; message: string };

const log = logger.child({ component: 'assistant' });

let quickjs: Promise<QuickJSWASMModule> | undefined;

const PRELUDE = `
const __logs = [];
globalThis.console = { log: (...items) => { if (__logs.length < 20) __logs.push(items.map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join(' ').slice(0, 500)); } };
globalThis.searchApi = async (query, limit) => JSON.parse(await __host_searchApi(String(query), String(limit ?? '')));
globalThis.callApi = async (procedure, input) => JSON.parse(await __host_callApi(String(procedure), JSON.stringify(input ?? {})));
`;

const wrap = (code: string) =>
  `(async () => {\n${code}\n})().then((value) => JSON.stringify({ value: value === undefined ? null : value, logs: __logs }))`;

const messageOf = (vm: QuickJSContext, error: QuickJSHandle) => {
  if (vm.typeof(error) !== 'object') return vm.getString(error);

  const handle = vm.getProp(error, 'message');
  const message = vm.typeof(handle) === 'string' ? vm.getString(handle) : 'The program failed';

  handle.dispose();

  return message;
};

const failureOf = (vm: QuickJSContext, error: QuickJSHandle): ProgramResult => {
  const message = messageOf(vm, error);

  if (/interrupted/i.test(message)) {
    return {
      ok: false,
      code: 'TIMEOUT',
      message: `The program ran past ${CODE_LIMITS.timeMs / 1000} s`,
    };
  }

  if (/out of memory/i.test(message)) {
    return {
      ok: false,
      code: 'OUT_OF_MEMORY',
      message: 'The program used more memory than allowed',
    };
  }

  return { ok: false, code: 'PROGRAM_ERROR', message: message.slice(0, 1000) };
};

const outputOf = (json: string): ProgramResult => {
  const parsed: unknown = JSON.parse(json);

  const value =
    typeof parsed === 'object' && parsed !== null && 'value' in parsed ? parsed.value : null;

  const logs = typeof parsed === 'object' && parsed !== null && 'logs' in parsed ? parsed.logs : [];
  const extra = Array.isArray(logs) && logs.length ? { logs: logs.map(String) } : {};
  const text = JSON.stringify(value);

  return text.length > CODE_LIMITS.outputChars
    ? {
        ok: true,
        truncated: true,
        result: text.slice(0, CODE_LIMITS.outputChars),
        note: 'The result was truncated. Return less: aggregate, filter or pick fields.',
        ...extra,
      }
    : { ok: true, result: value, ...extra };
};

const deliver = async (
  runtime: QuickJSRuntime,
  vm: QuickJSContext,
  deferred: QuickJSDeferredPromise,
  answer: Promise<unknown>,
) => {
  const outcome = await answer.then(
    (value) => ({ ok: true as const, json: JSON.stringify(value ?? null) }),
    (error: unknown) => {
      log.warn({ err: error }, 'code mode: a host call failed');

      return { ok: false as const, message: 'The call failed' };
    },
  );

  if (!vm.alive) return;

  const handle = outcome.ok ? vm.newString(outcome.json) : vm.newError(outcome.message);

  if (outcome.ok) deferred.resolve(handle);
  else deferred.reject(handle);

  handle.dispose();
  runtime.executePendingJobs();
};

const exposeHost = (
  runtime: QuickJSRuntime,
  vm: QuickJSContext,
  name: string,
  run: HostFunction,
  budget: { calls: number },
) => {
  const fn = vm.newFunction(`__host_${name}`, (...handles) => {
    const deferred = vm.newPromise();
    const args = handles.map((handle) => vm.getString(handle));

    budget.calls += 1;

    const answer =
      budget.calls > CODE_LIMITS.hostCalls
        ? Promise.resolve({ ok: false, code: 'TOO_MANY_CALLS', message: 'Too many API calls' })
        : run(args);

    void deliver(runtime, vm, deferred, answer);

    return deferred.handle;
  });

  vm.setProp(vm.global, `__host_${name}`, fn);
  fn.dispose();
};

const settle = async (runtime: QuickJSRuntime, vm: QuickJSContext, promise: QuickJSHandle) => {
  const resolved = vm.resolvePromise(promise);

  runtime.executePendingJobs();

  const outcome = await Promise.race([resolved, sleep(CODE_LIMITS.timeMs).then(() => null)]);

  promise.dispose();

  if (outcome === null) {
    return {
      ok: false as const,
      code: 'TIMEOUT' as const,
      message: `The program ran past ${CODE_LIMITS.timeMs / 1000} s`,
    };
  }

  if (outcome.error) {
    const failure = failureOf(vm, outcome.error);

    outcome.error.dispose();

    return failure;
  }

  const json = vm.getString(outcome.value);

  outcome.value.dispose();

  return outputOf(json);
};

const dispose = (runtime: QuickJSRuntime, vm: QuickJSContext) => {
  try {
    vm.dispose();
    runtime.dispose();
  } catch (error) {
    log.warn({ err: error }, 'code mode: the sandbox did not close cleanly');
  }
};

export const runProgram = async (
  code: string,
  host: { searchApi: HostFunction; callApi: HostFunction },
): Promise<ProgramResult> => {
  quickjs ??= newQuickJSWASMModuleFromVariant(variant);

  const runtime = (await quickjs).newRuntime();

  runtime.setMemoryLimit(CODE_LIMITS.memoryBytes);
  runtime.setMaxStackSize(CODE_LIMITS.stackBytes);
  runtime.setInterruptHandler(shouldInterruptAfterDeadline(Date.now() + CODE_LIMITS.timeMs));

  const vm = runtime.newContext();
  const budget = { calls: 0 };

  try {
    exposeHost(runtime, vm, 'searchApi', host.searchApi, budget);
    exposeHost(runtime, vm, 'callApi', host.callApi, budget);
    vm.unwrapResult(vm.evalCode(PRELUDE, 'prelude.js')).dispose();

    const started = vm.evalCode(wrap(code), 'program.js');

    if (started.error) {
      const failure = failureOf(vm, started.error);

      started.error.dispose();

      return failure;
    }

    return await settle(runtime, vm, started.value);
  } finally {
    dispose(runtime, vm);
  }
};
