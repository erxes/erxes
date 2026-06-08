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

  type SavedWidget {
    _id: String!
    userId: String!
    name: String!
    chartType: String!
    filters: JSON!
    position: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  input SavedWidgetInput {
    name: String!
    chartType: String!
    filters: JSON!
    position: Int
  }

  type ExportResult {
  success: Boolean!
  content: String
  filename: String
  error: String
}

extend type Query {
  exportDealReport(chartType: String!, filters: JSON, format: String): ExportResult
}

  extend type Mutation {
    saveWidget(widget: SavedWidgetInput!): SavedWidget
    updateWidget(_id: String!, widget: SavedWidgetInput!): SavedWidget
    deleteWidget(_id: String!): Boolean
  }

  extend type Query {
    userWidgets: [SavedWidget!]!
  }
`;

export const queries = ``;