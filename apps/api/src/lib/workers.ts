import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { logger } from '~/logger';

const YOUNG_HEAP_MB = 16;

const log = logger.child({ component: 'workers' });

/** The worker module `name` beside the module at `from` (its `import.meta.url`), .ts in dev, .js built. */
export const workerFile = (name: string, from: string) =>
  new URL(`./${name}${extname(fileURLToPath(from))}`, from);

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
  file: URL,
  { data, heapMb, signal }: { data: unknown; heapMb: number; signal: AbortSignal },
  answerOf: (message: unknown, reply: (message: unknown) => void) => T | undefined,
) =>
  new Promise<WorkerEnd<T>>((resolve) => {
    const worker = new Worker(file, {
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

      log.warn({ err: error, worker: file.pathname }, 'a worker failed');
      finish({ ended: 'failed' });
    });
    worker.once('exit', () => finish({ ended: 'failed' }));
  });
