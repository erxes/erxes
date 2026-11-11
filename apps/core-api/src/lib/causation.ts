import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * The automation run doing the current work, if any. Events published
 * meanwhile carry it (`caused_by_run`, `depth`), so automations can't trigger
 * themselves or loop forever, and audit entries say which automation acted.
 */
export interface RunCause {
  runId: string;
  automationId: string;
  automationName: string;
  depth: number;
}

const storage = new AsyncLocalStorage<RunCause>();

export const withRunCause = <T>(cause: RunCause, fn: () => Promise<T>) => storage.run(cause, fn);

export const currentRunCause = () => storage.getStore() ?? null;
