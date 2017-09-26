export const insightsPieChart = `
  query insights($brandId: String, $startDate: String, $endDate: String) {
    insights(brandId: $brandId, startDate: $startDate, endDate: $endDate) {
      name
      value
    }
  }
`;

export const insightsPunchCard = `
  query insightsPunchCard($type: String, $integrationType: String,
    $brandId: String, $endDate: String) {
    insightsPunchCard(type: $type, integrationType: $integrationType,
      brandId: $brandId, endDate: $endDate)
  }
`;

export const insightsMain = `
  query insightsMain($type: String, $integrationType: String,
    $brandId: String, $startDate: String, $endDate: String) {
    insightsMain(type: $type, integrationType: $integrationType,
      brandId: $brandId, startDate: $startDate, endDate: $endDate)
  }
`;

export const insightsFirstResponse = `
  query insightsFirstResponse($integrationType: String, $brandId: String, 
    $startDate: String, $endDate: String) {
    insightsFirstResponse(integrationType: $integrationType, brandId: $brandId, 
      startDate: $startDate, endDate: $endDate)
  }
`;
