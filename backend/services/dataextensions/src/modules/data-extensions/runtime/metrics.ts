interface ITimer {
  count: number;
  errors: number;
  totalMs: number;
  maxMs: number;
}

const newTimer = (): ITimer => ({ count: 0, errors: 0, totalMs: 0, maxMs: 0 });

/**
 * Process-local counters for /metrics. Labels are bounded (owner and
 * operation names from the registry), never tenant or record ids.
 */
const ownerCalls = new Map<string, ITimer>();
const schemaBuilds = newTimer();
let ownerRetries = 0;

const record = (timer: ITimer, ms: number, failed: boolean) => {
  timer.count++;
  timer.totalMs += ms;
  timer.maxMs = Math.max(timer.maxMs, ms);

  if (failed) {
    timer.errors++;
  }
};

export const recordOwnerCall = (
  owner: string,
  operation: string,
  ms: number,
  failed: boolean,
) => {
  const key = `${owner}.${operation}`;
  let timer = ownerCalls.get(key);

  if (!timer) {
    timer = newTimer();
    ownerCalls.set(key, timer);
  }

  record(timer, ms, failed);
};

export const recordOwnerRetry = () => {
  ownerRetries++;
};

export const recordSchemaBuild = (ms: number, failed: boolean) =>
  record(schemaBuilds, ms, failed);

const summarize = ({ count, errors, totalMs, maxMs }: ITimer) => ({
  count,
  errors,
  averageMs: count ? Math.round(totalMs / count) : 0,
  maxMs: Math.round(maxMs),
});

export const metricsSnapshot = () => ({
  ownerCalls: Object.fromEntries(
    Array.from(ownerCalls.entries()).map(([key, timer]) => [
      key,
      summarize(timer),
    ]),
  ),
  ownerRetries,
  schemaBuilds: summarize(schemaBuilds),
});
