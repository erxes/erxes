import type {
  CallKpiScorecardQuery,
  CallVolumeSeriesQuery,
  CallCarrierBreakdownQuery,
  CallHeatmapQuery,
  CallHeatmapDailyQuery,
  CallTopNumbersQuery,
  GetCallbackStatsQuery,
  CallReportsDashboardQuery,
  CallHistoryListQuery,
  CallSlaReportQuery,
} from '~/gql/graphql';
export type KpiScorecard = NonNullable<
  CallKpiScorecardQuery['callKpiScorecard']
>;

export type VolumePoint = NonNullable<
  NonNullable<CallVolumeSeriesQuery['callVolumeSeries']>[number]
>;

export type CarrierSlice = NonNullable<
  NonNullable<CallCarrierBreakdownQuery['callCarrierBreakdown']>[number]
>;

export type HeatCell = NonNullable<
  NonNullable<CallHeatmapQuery['callHeatmap']>[number]
>;

export type HeatMetric = 'total' | 'answered' | 'noAnswer';

export type DayHourCell = NonNullable<
  NonNullable<CallHeatmapDailyQuery['callHeatmapDaily']>[number]
>;

export type TopNumber = NonNullable<
  NonNullable<CallTopNumbersQuery['callTopNumbers']>[number]
>;

export type CallbackStat = NonNullable<
  NonNullable<GetCallbackStatsQuery['getCallbackStats']>[number]
>;

export type QueueStat = NonNullable<
  NonNullable<CallReportsDashboardQuery['callGetQueueStats']>[number]
>;

export type AgentStat = NonNullable<
  NonNullable<CallReportsDashboardQuery['callGetAgentStats']>[number]
>;

export interface Integration {
  inboxId: string;
  phone: string;
  [key: string]: unknown;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface CallFilters {
  integrationId: string;
  setIntegrationId: (id: string) => void;
  queueId: string;
  setQueueId: (id: string) => void;
  direction: string;
  setDirection: (d: string) => void;
  dateFilter: string;
  setDateFilter: (v: string) => void;

  startDate: string;
  endDate: string;

  dateRangeLabel: string;
}

export type CallHistoryEntry = CallHistoryPage['entries'][number];

export type CallHistoryAgent = CallHistoryPage['agents'][number];

export type CallHistoryPage = NonNullable<
  CallHistoryListQuery['callHistoryList']
>;

export type SlaTotals = SlaReport['summary'];

export type SlaQueue = SlaReport['queues'][number];

export type SlaPoint = SlaReport['series'][number];

export type SlaBreach = SlaReport['breaches'][number];

export type MissedReason = MissedReasonCount['reason'];

export type MissedReasonCount = SlaReport['missedReasons'][number];

export type MissedHourCell = SlaReport['missedByHour'][number];

export type SlaReport = NonNullable<CallSlaReportQuery['callSlaReport']>;
