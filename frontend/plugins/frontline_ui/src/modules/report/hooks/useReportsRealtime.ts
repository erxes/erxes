import { useApolloClient, useSubscription } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { FRONTLINE_REPORTS_CHANGED } from '@/report/graphql/subscriptions/reportsChanged';
import { createReportRefresh } from '@/report/utils/reportRefresh';
import { refetchReportQueries } from '@/report/utils/reportQueries';

export const useReportsRealtime = (): void => {
  const client = useApolloClient();
  const refreshRef = useRef<ReturnType<typeof createReportRefresh>>();
  const reconcile = useCallback(() => {
    if (document.visibilityState !== 'hidden' && navigator.onLine) {
      refreshRef.current?.schedule();
    }
  }, []);

  useEffect(() => {
    const refresh = createReportRefresh((scopes, signal) =>
      refetchReportQueries(client, scopes, signal),
    );
    refreshRef.current = refresh;
    // Reconcile updates missed while this browser was asleep or offline.
    window.addEventListener('online', reconcile);
    document.addEventListener('visibilitychange', reconcile);
    reconcile();

    return () => {
      refreshRef.current = undefined;
      refresh.dispose();
      window.removeEventListener('online', reconcile);
      document.removeEventListener('visibilitychange', reconcile);
    };
  }, [client, reconcile]);

  useSubscription(FRONTLINE_REPORTS_CHANGED, {
    ignoreResults: true,
    onData: ({ data }) => {
      if (document.visibilityState === 'hidden' || !navigator.onLine) return;
      const scopes = data.data?.frontlineReportsChanged.scopes;
      if (scopes) refreshRef.current?.schedule(scopes);
    },
    onError: reconcile,
  });
};
