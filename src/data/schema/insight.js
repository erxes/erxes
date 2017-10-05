export const types = `
  type InsightData {
    name: String
    value: Int
  }
`;

export const queries = `
  insights(brandId: String, startDate: String, endDate: String): [InsightData]
  insightsPunchCard(type: String, integrationType: String,
      brandId: String, endDate: String): JSON
  insightsMain(type: String, integrationType: String,
      brandId: String, startDate: String, endDate: String): JSON
  insightsFirstResponse(integrationType: String, brandId: String,
      startDate: String, endDate: String): JSON
`;
