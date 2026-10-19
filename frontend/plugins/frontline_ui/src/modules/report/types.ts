import type {
  ReportConversationOpenQuery,
  ReportConversationSourcesQuery,
  ReportTicketCustomPropertiesQuery,
  ReportChartsQuery,
  ReportConversationListQuery,
  ReportConversationResponsesQuery,
  ReportFacebookPagesQuery,
  ReportFacebookSummaryQuery,
  ReportFacebookActivityQuery,
  ReportFacebookPostsQuery,
  ReportFacebookBotsQuery,
  ReportFacebookSyncPostStatsMutation,
  TicketReportFilter,
} from '~/gql/graphql';
import { Icon } from '@tabler/icons-react';

export type ReportMetric = NonNullable<
  ReportConversationOpenQuery['reportConversationOpen']
>;

export type ReportSource = NonNullable<
  NonNullable<
    ReportConversationSourcesQuery['reportConversationSources']
  >[number]
>;

export interface CardConfig {
  id: string;
  colSpan: 1 | 2;
}

export interface DroppableAreaProps {
  id: string;
  colSpan: 1 | 2;
  children: React.ReactNode;
}

export interface ReportCardProps {
  title: string;
  value: number | string;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

type TicketCustomPropertyRow = NonNullable<
  NonNullable<
    ReportTicketCustomPropertiesQuery['reportTicketCustomProperties']
  >[number]
>;

export type TagData = Omit<TicketCustomPropertyRow, 'group'> &
  Partial<Pick<TicketCustomPropertyRow, 'group'>>;

export type SourceData = NonNullable<
  NonNullable<
    ReportConversationSourcesQuery['reportConversationSources']
  >[number]
>;

export interface TicketPropertyFilter {
  propertyId: string;
  type?: string;
  values: string[];
}

export type ReportChartFilters = TicketReportFilter;

export type ReportChart = NonNullable<
  NonNullable<ReportChartsQuery['reportCharts']>[number]
>;

export type SavedReportChartFilters = Partial<
  NonNullable<ReportChart['filters']>
>;

export type ConversationListItem = NonNullable<
  NonNullable<
    NonNullable<ReportConversationListQuery['reportConversationList']>['list']
  >[number]
>;

export type ConversationUserMessageStat = NonNullable<
  NonNullable<
    ReportConversationResponsesQuery['reportConversationResponses']
  >[number]
>;

export enum ResponsesChartType {
  Table = 'table',
  Bar = 'bar',
  Line = 'line',
  Pie = 'pie',
  Radar = 'radar',
}

export const isResponsesChartType = (
  value: unknown,
): value is ResponsesChartType =>
  Object.values(ResponsesChartType).some((type) => type === value);

export interface ResponsesChartTypeOption {
  IconComponent: Icon;
  value: ResponsesChartType;
  label: string;
}

export enum ReportHotKeyScope {
  ReportPage = 'report-page',
}

export type FacebookPage = NonNullable<
  NonNullable<ReportFacebookPagesQuery['reportFacebookPages']>[number]
>;

export type FacebookSummary = NonNullable<
  ReportFacebookSummaryQuery['reportFacebookSummary']
>;

export type FacebookActivityPoint = NonNullable<
  NonNullable<ReportFacebookActivityQuery['reportFacebookActivity']>[number]
>;

export type FacebookPostRow = NonNullable<
  NonNullable<
    NonNullable<ReportFacebookPostsQuery['reportFacebookPosts']>['list']
  >[number]
>;

export type FacebookSyncResult = NonNullable<
  ReportFacebookSyncPostStatsMutation['reportFacebookSyncPostStats']
>;

export type FacebookPostResult = NonNullable<
  ReportFacebookPostsQuery['reportFacebookPosts']
>;

export type FacebookBotRow = NonNullable<
  NonNullable<ReportFacebookBotsQuery['reportFacebookBots']>[number]
>;
