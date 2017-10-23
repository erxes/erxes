const main = `
  query insightsMain($type: String, $integrationType: String,
    $brandId: String, $startDate: String, $endDate: String) {
    insightsMain(type: $type, integrationType: $integrationType,
      brandId: $brandId, startDate: $startDate, endDate: $endDate)
  }
`;

const pieChart = `
  query insights($brandId: String, $startDate: String, $endDate: String) {
    insights(brandId: $brandId, startDate: $startDate, endDate: $endDate) {
      name
      value
    }
  }
`;

const punchCard = `
  query insightsPunchCard($type: String, $integrationType: String,
    $brandId: String, $endDate: String) {
    insightsPunchCard(type: $type, integrationType: $integrationType,
      brandId: $brandId, endDate: $endDate)
  }
`;

const firstResponse = `
  query insightsFirstResponse($integrationType: String, $brandId: String,
    $startDate: String, $endDate: String) {
    insightsFirstResponse(integrationType: $integrationType, brandId: $brandId, 
      startDate: $startDate, endDate: $endDate)
  }
`;

const brands = `
  query brands {
    brands {
      _id
      name
    }
  }
`;

export default {
  main,
  pieChart,
  punchCard,
  firstResponse,
  brands
};
