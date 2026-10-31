import { ApolloClient, NetworkStatus } from '@apollo/client';
import type { FrontlineReportScope } from '~/gql/graphql';

export const REPORT_SCOPES: readonly FrontlineReportScope[] = [
  'inbox',
  'ticket',
  'facebook',
  'call',
  'charts',
];

const CALL_REPORT_QUERIES = new Set([
  'CallReportsDashboard',
  'CallKpiScorecard',
  'CallVolumeSeries',
  'CallCarrierBreakdown',
  'CallHeatmap',
  'CallHeatmapDaily',
  'CallTopNumbers',
  'GetCallbackStats',
  'CallSlaReport',
  'callHistoryList',
  'callReportIntegrations',
]);

export const getReportQueryScope = (
  queryName?: string,
): FrontlineReportScope | undefined => {
  if (!queryName || queryName.endsWith('Export')) return undefined;
  if (queryName === 'ReportCharts') return 'charts';
  if (queryName.startsWith('ReportConversation')) return 'inbox';
  if (queryName.startsWith('ReportTicket')) return 'ticket';
  if (queryName.startsWith('ReportFacebook')) return 'facebook';
  if (CALL_REPORT_QUERIES.has(queryName)) return 'call';
  return undefined;
};

export const refetchReportQueries = async (
  client: ApolloClient<object>,
  scopes: ReadonlySet<FrontlineReportScope>,
  signal: AbortSignal,
): Promise<void> => {
  const queries = [...client.getObservableQueries('active').values()].filter(
    ({ queryName }) => {
      const scope = getReportQueryScope(queryName);
      return scope !== undefined && scopes.has(scope);
    },
  );

  await Promise.allSettled(
    queries.map(async (query) => {
      const context: Record<string, unknown> & { fetchOptions?: RequestInit } =
        query.options.context ?? {};
      const controller = new AbortController();
      const abort = () => controller.abort();
      const signals = [
        signal,
        ...(context.fetchOptions?.signal ? [context.fetchOptions.signal] : []),
      ];
      signals.forEach((source) => source.addEventListener('abort', abort));
      if (signals.some((source) => source.aborted)) controller.abort();

      try {
        // A disposable refetch preserves the card's query options and error state.
        // Disable deduplication so aborting this refresh cannot cancel another owner.
        await query.reobserve(
          {
            fetchPolicy:
              query.options.fetchPolicy === 'no-cache'
                ? 'no-cache'
                : 'network-only',
            pollInterval: 0,
            context: {
              ...context,
              queryDeduplication: false,
              fetchOptions: {
                ...context.fetchOptions,
                signal: controller.signal,
              },
            },
          },
          NetworkStatus.refetch,
        );
      } finally {
        signals.forEach((source) => source.removeEventListener('abort', abort));
      }
    }),
  );
};
