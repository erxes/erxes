async function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export type RetryInput<T> = {
  fn: (() => Promise<T>) | (() => T);
  retryExhaustedLog?: string;
  intervalMs?: number;
  maxTries?: number;
  retryLog?: string;
  successLog?: string;
};

async function retry<T>({
  fn,
  intervalMs = 1000,
  maxTries = Number.MAX_SAFE_INTEGER,
  retryExhaustedLog = 'Retry exhausted',
  retryLog,
  successLog
}: RetryInput<T>): Promise<T> {
  let error = new Error(retryExhaustedLog);

  for (let tryIdx = 0; tryIdx < maxTries; tryIdx++) {
    tryIdx == 1 && retryLog && console.log(retryLog);

    try {
      const result = await fn();
      successLog && console.log(successLog);
      return result;
    } catch (e) {
      error = e;
    }

    await sleep(intervalMs);
  }

  retryExhaustedLog && console.error(retryExhaustedLog);

  throw error;
}

export default retry;
