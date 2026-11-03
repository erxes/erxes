export const AGENTS_FILE_OPERATION_TIMEOUT_MS = 60_000;
export const AGENTS_FILE_READ_TIMEOUT_MS = 15_000;

/** Bound the caller's wait. Shared storage helpers do not accept cancellation. */
export const waitForAgentsFileOperation = <T>(
  operation: Promise<T>,
  signal: AbortSignal,
): Promise<T> =>
  new Promise((resolve, reject) => {
    let settled = false;
    const finish = (next: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      signal.removeEventListener('abort', abort);
      next();
    };
    const abort = () =>
      finish(() =>
        reject(new Error('File operation timed out or was cancelled.')),
      );

    signal.addEventListener('abort', abort, { once: true });
    operation.then(
      (value) => finish(() => resolve(value)),
      (error) => finish(() => reject(error)),
    );

    if (signal.aborted) {
      abort();
    }
  });
