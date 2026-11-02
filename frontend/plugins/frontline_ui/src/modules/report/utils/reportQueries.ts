import type { ApolloClient } from '@apollo/client';

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

const isReportQuery = (queryName?: string): boolean =>
  Boolean(
    queryName &&
    !queryName.endsWith('Export') &&
    (queryName === 'ReportCharts' ||
      queryName.startsWith('ReportConversation') ||
      queryName.startsWith('ReportTicket') ||
      queryName.startsWith('ReportFacebook') ||
      CALL_REPORT_QUERIES.has(queryName)),
  );

export const refetchReportQueries = async (
  client: ApolloClient<object>,
): Promise<void> => {
  await client.refetchQueries({
    include: 'active',
    onQueryUpdated: (query) =>
      isReportQuery(query.queryName) ? query.refetch() : false,
  });
};
