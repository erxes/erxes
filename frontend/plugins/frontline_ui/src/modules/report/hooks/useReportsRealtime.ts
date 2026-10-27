import { useApolloClient } from '@apollo/client';
import { useEffect } from 'react';
import { FRONTLINE_REPORTS_CHANGED } from '@/report/graphql/subscriptions/reportsChanged';
import { createReportRefresh } from '@/report/utils/reportRefresh';
import { refetchReportQueries } from '@/report/utils/reportQueries';

const RECONCILE_INTERVAL_MS = 60_000;

export const useReportsRealtime = (): void => {
  const client = useApolloClient();

  useEffect(() => {
    const refresh = createReportRefresh((scopes, signal) =>
      refetchReportQueries(client, scopes, signal),
    );
    const reconcile = () => {
      if (document.visibilityState !== 'hidden' && navigator.onLine) {
        refresh.schedule();
      }
    };
    const subscription = client
      .subscribe({ query: FRONTLINE_REPORTS_CHANGED })
      .subscribe({
        next: ({ data }) => {
          if (document.visibilityState === 'hidden' || !navigator.onLine)
            return;
          const scopes = data?.frontlineReportsChanged.scopes;
          if (scopes) refresh.schedule(scopes);
        },
        error: reconcile,
      });
    // Reconcile updates missed while this browser was asleep or offline.
    window.addEventListener('focus', reconcile);
    window.addEventListener('online', reconcile);
    document.addEventListener('visibilitychange', reconcile);
    const interval = window.setInterval(reconcile, RECONCILE_INTERVAL_MS);
    reconcile();

    return () => {
      subscription.unsubscribe();
      refresh.dispose();
      window.clearInterval(interval);
      window.removeEventListener('focus', reconcile);
      window.removeEventListener('online', reconcile);
      document.removeEventListener('visibilitychange', reconcile);
    };
  }, [client]);
};
