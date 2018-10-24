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
