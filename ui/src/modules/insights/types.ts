export interface IQueryParams {
  brandIds: string;
  integrationIds: string;
  boardId: string;
  pipelineIds: string;
  endDate: string;
  startDate: string;
}

export interface IParams {
  type: string;
  queryParams: IQueryParams;
}

export interface IDealParams {
  queryParams: IQueryParams;
  status: string;
}

export interface IInsightType {
  name: string;
  image: string;
  to: string;
  desc: string;
}

export interface IChartParams {
  x: string;
  y: number;
}

export interface IPieChartData {
  label: string;
  value: number;
}

export interface IPunchCardData {
  count: number;
  day: number;
  hour: number;
  date: string;
}

export type SummaryData = {
  count: number;
  title: string;
};

export type PunchCardQueryResponse = {
  insightsPunchCard: IPunchCardData[];
  loading: boolean;
};

export type DealPunchCardQueryResponse = {
  dealInsightsPunchCard: IPunchCardData[];
  loading: boolean;
};

export type SummaryDataQueryResponse = {
  insightsSummaryData: SummaryData[];
  loading: boolean;
};

export type ConversationCustomerAvgQueryResponse = {
  insightsConversationCustomerAvg: SummaryData[];
  loading: boolean;
};

export type ConversationInternalAvgQueryResponse = {
  insightsConversationInternalAvg: SummaryData[];
  loading: boolean;
};

export type ConversationOverallAvgQueryResponse = {
  insightsConversationOverallAvg: SummaryData[];
  loading: boolean;
};

export type ConversationSummaryDataQueryResponse = {
  insightsConversationSummary: {
    avg: SummaryData[];
    trend: IChartParams[];
    teamMembers: IChartParams[];
  };
  loading: boolean;
};

export type TrendQueryResponse = {
  insightsTrend: IChartParams[];
  loading: boolean;
};

export type DealMainQueryResponse = {
  dealInsightsMain: {
    summary: SummaryData[];
    trend: IChartParams[];
  };
  loading: boolean;
};

export type DealTeamMemberResponse = {
  dealInsightsByTeamMember: IChartParams[];
  loading: boolean;
};

export type SummaryQueryResponse = {
  insightsConversation: {
    summary: SummaryData[];
    trend: IChartParams[];
  };
  loading: boolean;
};

export type IntegrationChartQueryResponse = {
  insightsIntegrations: IPieChartData[];
  loading: boolean;
};

export type TagChartQueryResponse = {
  insightsTags: IPieChartData[];
  loading: boolean;
};

export type FirstResponseQueryResponse = {
  insightsFirstResponse: {
    trend: IPieChartData[];
    time: number;
    integration: IPieChartData[];
    summaries: number[];
  };
  loading: boolean;
};

export type ResponseCloseQueryResponse = {
  insightsResponseClose: {
    trend: IPieChartData[];
    time: number;
    integration: IPieChartData[];
  };
  loading: boolean;
};

export type VolumeReportExportQueryResponse = {
  insightVolumeReportExport: string;
  loading: boolean;
};
