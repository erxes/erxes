export const REPORT_CONFIG = {
  openDates: {
    queryKey: 'reportConversationOpenDate',
    supportsPercentage: false,
    defaultChartType: 'bar',
    tableOnly: false,
  },
  resolvedDates: {
    queryKey: 'reportConversationResolvedDate',
    supportsPercentage: false,
    defaultChartType: 'bar',
    tableOnly: false,
  },
  sources: {
    queryKey: 'reportConversationSources',
    supportsPercentage: true,
    defaultChartType: 'line',
    tableOnly: false,
  },
  tags: {
    queryKey: 'reportConversationTags',
    supportsPercentage: true,
    defaultChartType: 'pie',
    tableOnly: false,
  },
  responses: {
    queryKey: 'reportConversationResponses',
    supportsPercentage: true,
    defaultChartType: 'bar',
    tableOnly: false,
  },
  list: {
    queryKey: 'reportConversationList',
    supportsPercentage: false,
    defaultChartType: 'table',
    tableOnly: true,
  },
};

export type ReportType = keyof typeof REPORT_CONFIG;
