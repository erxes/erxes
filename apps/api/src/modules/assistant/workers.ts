import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { logger } from '~/logger';

const EXTENSION = extname(fileURLToPath(import.meta.url));

const YOUNG_HEAP_MB = 16;

const log = logger.child({ component: 'assistant' });

export type WorkerEnd<T> =
  | { ended: 'answer'; answer: T }
  | { ended: 'aborted' }
  | { ended: 'out-of-memory' }
  | { ended: 'failed' };

export const workerGate = (atOnce: number, waiting: number) => {
  const gate = { running: 0, queue: [] as (() => void)[] };

  const acquire = (signal: AbortSignal) => {
    if (gate.running < atOnce) {
      gate.running += 1;

      return Promise.resolve('granted' as const);
    }

    if (gate.queue.length >= waiting) return Promise.resolve('full' as const);

    return new Promise<'granted' | 'timed-out'>((resolve) => {
      const grant = () => {
        signal.removeEventListener('abort', cancel);
        resolve('granted');
      };

      const cancel = () => {
        gate.queue.splice(gate.queue.indexOf(grant), 1);
        resolve('timed-out');
      };

      gate.queue.push(grant);
      signal.addEventListener('abort', cancel, { once: true });
    });
  };

  const release = () => {
    const next = gate.queue.shift();

    if (next) next();
    else gate.running -= 1;
  };

  return { acquire, release };
};

export const runWorker = <T>(
  name: string,
  { data, heapMb, signal }: { data: unknown; heapMb: number; signal: AbortSignal },
  answerOf: (message: unknown, reply: (message: unknown) => void) => T | undefined,
) =>
  new Promise<WorkerEnd<T>>((resolve) => {
    const worker = new Worker(new URL(`./${name}${EXTENSION}`, import.meta.url), {
      workerData: data,
      execArgv: [],
      resourceLimits: { maxOldGenerationSizeMb: heapMb, maxYoungGenerationSizeMb: YOUNG_HEAP_MB },
    });

    let settled = false;

    const finish = (end: WorkerEnd<T>) => {
      if (settled) return;

      settled = true;
      signal.removeEventListener('abort', abort);
      void worker.terminate();
      resolve(end);
    };

    const abort = () => finish({ ended: 'aborted' });

    const reply = (message: unknown) => {
      if (!settled) worker.postMessage(message, []);
    };

    signal.addEventListener('abort', abort, { once: true });
    worker.on('message', (message: unknown) => {
      const answer = answerOf(message, reply);

      if (answer !== undefined) finish({ ended: 'answer', answer });
    });
    worker.once('error', (error: Error & { code?: string }) => {
      if (error.code === 'ERR_WORKER_OUT_OF_MEMORY') {
        finish({ ended: 'out-of-memory' });

        return;
      }

      log.warn({ err: error, worker: name }, 'assistant: a worker failed');
      finish({ ended: 'failed' });
    });
    worker.once('exit', () => finish({ ended: 'failed' }));
  });
