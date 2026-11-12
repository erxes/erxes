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

/**
 * The import doing the current work, if any. Its events carry
 * `payload._import` (`{ id, quiet }`); a quiet import (the default) starts no
 * automations and sends no owner notifications, so 10,000 rows don't become
 * 10,000 runs and messages.
 */
export interface ImportCause {
  importId: string;
  quiet: boolean;
}

const importStorage = new AsyncLocalStorage<ImportCause>();

export const withImportCause = <T>(cause: ImportCause, fn: () => Promise<T>) => importStorage.run(cause, fn);

export const currentImport = () => importStorage.getStore() ?? null;
