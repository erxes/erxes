import { ASSISTANT_PROGRAM_FAILURES, ASSISTANT_PROGRAM_HOST_FUNCTIONS } from '@erxes/core-db/enums';
import { z } from 'zod';
import { logger } from '~/logger';
import type { HostAnswer, ProgramJob } from './codeMode.worker';
import { refusal } from './tools/results';
import { runWorker, type WorkerEnd, workerGate } from './workers';

export const CODE_LIMITS = {
  timeMs: 10_000,
  memoryBytes: 32 * 1024 * 1024,
  stackBytes: 512 * 1024,
  outputChars: 20_000,
  hostCalls: 50,
};

const PROGRAMS_AT_ONCE = 4;

const PROGRAMS_WAITING = 8;

const WORKER_HEAP_MB = 64;

const ProgramResult = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    result: z.unknown(),
    truncated: z.literal(true).optional(),
    note: z.string().optional(),
    logs: z.array(z.string()).optional(),
  }),
  z.object({ ok: z.literal(false), code: z.enum(ASSISTANT_PROGRAM_FAILURES), message: z.string() }),
]);

export type ProgramResult = z.infer<typeof ProgramResult>;

const FromProgram = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('call'),
    id: z.int(),
    name: z.enum(ASSISTANT_PROGRAM_HOST_FUNCTIONS),
    args: z.array(z.string()),
  }),
  z.object({ type: z.literal('done'), result: ProgramResult }),
  z.object({ type: z.literal('out-of-memory') }),
]);

export type FromProgram = z.infer<typeof FromProgram>;

type HostName = (typeof ASSISTANT_PROGRAM_HOST_FUNCTIONS)[number];

type Host = Record<HostName, (args: string[]) => Promise<unknown>>;

const log = logger.child({ component: 'assistant' });

const gate = workerGate(PROGRAMS_AT_ONCE, PROGRAMS_WAITING);

const BUSY = refusal(
  'CODE_MODE_BUSY',
  'Programs are running for other members; try again in a moment',
);

const TIMED_OUT: ProgramResult = {
  ok: false,
  code: 'TIMEOUT',
  message: `The program ran past ${CODE_LIMITS.timeMs / 1000} s`,
};

const OUT_OF_MEMORY: ProgramResult = {
  ok: false,
  code: 'OUT_OF_MEMORY',
  message: 'The program used more memory than allowed',
};

const FAILED: ProgramResult = { ok: false, code: 'PROGRAM_ERROR', message: 'The program failed' };

const answerCall = async (
  host: Host,
  budget: { calls: number },
  name: HostName,
  args: string[],
): Promise<HostAnswer['answer']> => {
  budget.calls += 1;

  if (budget.calls > CODE_LIMITS.hostCalls) {
    return { ok: true, json: JSON.stringify(refusal('TOO_MANY_CALLS', 'Too many API calls')) };
  }

  try {
    return { ok: true, json: JSON.stringify((await host[name](args)) ?? null) };
  } catch (error) {
    log.warn({ err: error, call: name }, 'code mode: a host call failed');

    return { ok: false, message: 'The call failed' };
  }
};

const conversation = (host: Host) => {
  const budget = { calls: 0 };

  return (message: unknown, reply: (message: HostAnswer) => void): ProgramResult | undefined => {
    const parsed = FromProgram.safeParse(message);

    if (!parsed.success) return FAILED;

    if (parsed.data.type === 'done') return parsed.data.result;

    if (parsed.data.type === 'out-of-memory') return OUT_OF_MEMORY;

    const { id, name, args } = parsed.data;

    void answerCall(host, budget, name, args).then((answer) => reply({ id, answer }));

    return undefined;
  };
};

const resultOf = (end: WorkerEnd<ProgramResult>) => {
  if (end.ended === 'answer') return end.answer;

  if (end.ended === 'aborted') return TIMED_OUT;

  return end.ended === 'out-of-memory' ? OUT_OF_MEMORY : FAILED;
};

export const runProgram = async (code: string, host: Host) => {
  const granted = await gate.acquire(AbortSignal.timeout(CODE_LIMITS.timeMs));

  if (granted !== 'granted') return BUSY;

  const job: ProgramJob = {
    code,
    memoryBytes: CODE_LIMITS.memoryBytes,
    stackBytes: CODE_LIMITS.stackBytes,
    outputChars: CODE_LIMITS.outputChars,
  };

  const end = await runWorker(
    'codeMode.worker',
    { data: job, heapMb: WORKER_HEAP_MB, signal: AbortSignal.timeout(CODE_LIMITS.timeMs) },
    conversation(host),
  ).finally(gate.release);

  return resultOf(end);
};
