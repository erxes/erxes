import { ASSISTANT_PROGRAM_HOST_FUNCTIONS } from '@erxes/core-db/enums';
import variant from '@jitl/quickjs-wasmfile-release-sync';
import {
  newQuickJSWASMModuleFromVariant,
  type QuickJSContext,
  type QuickJSDeferredPromise,
  type QuickJSHandle,
  type QuickJSRuntime,
} from 'quickjs-emscripten-core';
import { parentPort, workerData } from 'node:worker_threads';
import { z } from 'zod';
import type { FromProgram } from './codeMode';

const ProgramJob = z.object({
  code: z.string(),
  memoryBytes: z.int().min(1),
  stackBytes: z.int().min(1),
  outputChars: z.int().min(1),
});

export type ProgramJob = z.infer<typeof ProgramJob>;

const HostAnswer = z.object({
  id: z.int(),
  answer: z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), json: z.string() }),
    z.object({ ok: z.literal(false), message: z.string() }),
  ]),
});

export type HostAnswer = z.infer<typeof HostAnswer>;

const PRELUDE = `
const __logs = [];
globalThis.console = { log: (...items) => { if (__logs.length < 20) __logs.push(items.map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join(' ').slice(0, 500)); } };
globalThis.searchApi = async (query, limit) => JSON.parse(await __host_searchApi(String(query), String(limit ?? '')));
globalThis.callApi = async (procedure, input) => JSON.parse(await __host_callApi(String(procedure), JSON.stringify(input ?? {})));
`;

const wrap = (code: string) =>
  `(async () => {\n${code}\n})().then((value) => JSON.stringify({ value: value === undefined ? null : value, logs: __logs }))`;

const send = (message: FromProgram) => parentPort?.postMessage(message, []);

const messageOf = (vm: QuickJSContext, error: QuickJSHandle) => {
  if (vm.typeof(error) !== 'object') return vm.getString(error);

  const handle = vm.getProp(error, 'message');
  const message = vm.typeof(handle) === 'string' ? vm.getString(handle) : 'The program failed';

  handle.dispose();

  return message;
};

const failureOf = (vm: QuickJSContext, error: QuickJSHandle): FromProgram => {
  const message = messageOf(vm, error);

  error.dispose();

  if (/out of memory/i.test(message)) return { type: 'out-of-memory' };

  return {
    type: 'done',
    result: { ok: false, code: 'PROGRAM_ERROR', message: message.slice(0, 1000) },
  };
};

const outputOf = (json: string, outputChars: number): FromProgram => {
  const parsed: unknown = JSON.parse(json);

  const value =
    typeof parsed === 'object' && parsed !== null && 'value' in parsed ? parsed.value : null;

  const logs = typeof parsed === 'object' && parsed !== null && 'logs' in parsed ? parsed.logs : [];
  const extra = Array.isArray(logs) && logs.length ? { logs: logs.map(String) } : {};
  const text = JSON.stringify(value);

  return {
    type: 'done',
    result:
      text.length > outputChars
        ? {
            ok: true,
            truncated: true,
            result: text.slice(0, outputChars),
            note: 'The result was truncated. Return less: aggregate, filter or pick fields.',
            ...extra,
          }
        : { ok: true, result: value, ...extra },
  };
};

const calls = { made: 0, pending: new Map<number, QuickJSDeferredPromise>() };

const exposeHost = (
  vm: QuickJSContext,
  name: (typeof ASSISTANT_PROGRAM_HOST_FUNCTIONS)[number],
) => {
  const fn = vm.newFunction(`__host_${name}`, (...handles) => {
    const deferred = vm.newPromise();

    calls.made += 1;
    calls.pending.set(calls.made, deferred);
    send({
      type: 'call',
      id: calls.made,
      name,
      args: handles.map((handle) => vm.getString(handle)),
    });

    return deferred.handle;
  });

  vm.setProp(vm.global, `__host_${name}`, fn);
  fn.dispose();
};

const deliver = (runtime: QuickJSRuntime, vm: QuickJSContext, message: unknown) => {
  const { id, answer } = HostAnswer.parse(message);
  const deferred = calls.pending.get(id);

  if (!deferred) return;

  calls.pending.delete(id);

  const handle = answer.ok ? vm.newString(answer.json) : vm.newError(answer.message);

  if (answer.ok) deferred.resolve(handle);
  else deferred.reject(handle);

  handle.dispose();
  runtime.executePendingJobs();
};

const run = async (job: ProgramJob): Promise<FromProgram> => {
  const runtime = (await newQuickJSWASMModuleFromVariant(variant)).newRuntime();

  runtime.setMemoryLimit(job.memoryBytes);
  runtime.setMaxStackSize(job.stackBytes);

  const vm = runtime.newContext();

  parentPort?.on('message', (message: unknown) => deliver(runtime, vm, message));

  for (const name of ASSISTANT_PROGRAM_HOST_FUNCTIONS) exposeHost(vm, name);

  vm.unwrapResult(vm.evalCode(PRELUDE, 'prelude.js')).dispose();

  const started = vm.evalCode(wrap(job.code), 'program.js');

  if (started.error) return failureOf(vm, started.error);

  const resolved = vm.resolvePromise(started.value);

  runtime.executePendingJobs();

  const outcome = await resolved;

  started.value.dispose();

  if (outcome.error) return failureOf(vm, outcome.error);

  const json = vm.getString(outcome.value);

  outcome.value.dispose();

  return outputOf(json, job.outputChars);
};

void run(ProgramJob.parse(workerData)).then(send);
