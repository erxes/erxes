export interface IQueryParams {
  brandId: string;
  endDate: string;
  startDate: string;
  integrationType: string;
}

export interface IParams {
  queryParams: IQueryParams;
}

export interface IParamsWithType {
  queryParams: IQueryParams;
  type: string;
}

export interface IChartParams {
  x: string;
  y: number;
}

export interface IPieChartData {
  label: string;
  value: number;
}

export interface InsightData {
  integration: IPieChartData[];
  tag: IPieChartData[];
}

export type SummaryData = {
  count: number;
  title: string;
};

export type PunchCardQueryResponse = {
  insightsPunchCard: number[][];
  loading: boolean;
};

export type MainQueryResponse = {
  insightsMain: {
    teamMembers: IChartParams[];
    summary: SummaryData[];
    trend: IChartParams[];
  };
  loading: boolean;
};

export type PieChartQueryResponse = {
  insights: { tag: IPieChartData[]; integration: IPieChartData[] };
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
