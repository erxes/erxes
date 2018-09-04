export const types = `
  type InsightData {
    id: String
    label: String
    value: Int
  }
`;

const params = `
  integrationType: String,
  brandId: String,
  startDate: String,
  endDate: String
`;

export const queries = `
  insights(brandId: String, startDate: String, endDate: String): [InsightData]
  insightsPunchCard(type: String, integrationType: String, brandId: String, endDate: String): JSON
  insightsMain(type: String, ${params}): JSON
  insightsFirstResponse(${params}): JSON
  insightsResponseClose(${params}): JSON
`;
