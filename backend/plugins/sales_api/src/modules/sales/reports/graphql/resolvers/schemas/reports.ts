export const types = `
  type DealReportDataset {
    data: [Float]
    label: String
  }

  type DealReportData {
    labels: [String]
    datasets: [DealReportDataset]
  }

  type KPIValue {
    current: Float!
    previous: Float!
    percentChange: Float!
  }

  type DashboardSummary {
    totalDeals: KPIValue!
    wonDeals: KPIValue!
    lostDeals: KPIValue!
    conversionRate: KPIValue!
    expectedRevenue: KPIValue!
  }

  type ForecastData {
    totalForecast: Float!
    byStage: [StageForecast!]!
    byProbability: [ProbabilityForecast!]!
  }

  type StageForecast {
    stageId: String
    stageName: String
    forecast: Float
  }

  type ProbabilityForecast {
    bucket: String
    forecast: Float
  }

  type StageDealGroup {
    stageId: String
    stageName: String
    deals: [JSON]
    totalCount: Int
  }

  extend type Query {
    dealReports(chartType: String!, filters: JSON): DealReportData
    dashboardSummary(filters: JSON): DashboardSummary
    forecastRevenue(filters: JSON): ForecastData
    dealsByStage(filters: JSON, sort: String, limit: Int, skip: Int): [StageDealGroup]
  }
  enum DealMutationType {
  create
  update
  delete
}

type DealChangePayload {
  mutation: DealMutationType!
  data: JSON
}

extend type Subscription {
  dealChanged(pipelineId: String): DealChangePayload
}
`;

export const queries = ``;
