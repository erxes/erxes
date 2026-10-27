import type { FrontlineReportScope } from '~/gql/graphql';
import { REPORT_SCOPES } from '@/report/utils/reportQueries';

const REFRESH_TIMEOUT_MS = 15_000;

export const createReportRefresh = (
  refetch: (
    scopes: ReadonlySet<FrontlineReportScope>,
    signal: AbortSignal,
  ) => Promise<void>,
) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let fetching = false;
  const pending = new Set<FrontlineReportScope>();
  let disposed = false;
  let controller: AbortController | undefined;

  const schedule = (
    scopes: readonly FrontlineReportScope[] = REPORT_SCOPES,
  ): void => {
    if (disposed) return;
    scopes.forEach((scope) => pending.add(scope));
    if (timer || fetching) return;
    timer = setTimeout(async () => {
      timer = undefined;
      const scopes = new Set(pending);
      pending.clear();
      fetching = true;
      controller = new AbortController();
      const signal = controller.signal;
      let finishAbort: () => void = () => undefined;
      const aborted = new Promise<void>((resolve) => {
        finishAbort = resolve;
        signal.addEventListener('abort', finishAbort, { once: true });
      });
      const timeout = setTimeout(() => controller?.abort(), REFRESH_TIMEOUT_MS);
      try {
        // Cancellation bounds the batch even when a link fails to settle on abort.
        await Promise.race([refetch(scopes, signal), aborted]);
      } catch {
        // Each query exposes its own error; periodic reconciliation retries later.
      } finally {
        clearTimeout(timeout);
        signal.removeEventListener('abort', finishAbort);
        controller = undefined;
        fetching = false;
        if (pending.size) schedule([]);
      }
    }, 250);
  };

  return {
    schedule,
    dispose: (): void => {
      disposed = true;
      pending.clear();
      if (timer) clearTimeout(timer);
      controller?.abort();
    },
  };
};
