const listParamsDef = `
  $integrationType: String,
  $brandId: String,
  $startDate: String,
  $endDate: String
`;

const listParamsValue = `
  integrationType: $integrationType,
  brandId: $brandId,
  startDate: $startDate,
  endDate: $endDate
`;

const pieChart = `
  query insights(${listParamsDef}) {
    insights(${listParamsValue})
  }
`;

const punchCard = `
  query insightsPunchCard($type: String, $integrationType: String,
    $brandId: String, $endDate: String) {
    insightsPunchCard(type: $type, integrationType: $integrationType,
      brandId: $brandId, endDate: $endDate)
  }
`;

const main = `
  query insightsMain($type: String, ${listParamsDef}) {
    insightsMain(type: $type, ${listParamsValue})
  }
`;

const firstResponse = `
  query insightsFirstResponse(${listParamsDef}) {
    insightsFirstResponse(${listParamsValue})
  }
`;

const responseClose = `
  query insightsResponseClose(${listParamsDef}) {
    insightsResponseClose(${listParamsValue})
  }
`;

const responseSummary = `
  query insightsConversation(${listParamsDef}) {
    insightsConversation(${listParamsValue})
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

const insightVolumeReportExport = `
  query insightVolumeReportExport($type: String, ${listParamsDef}) {
    insightVolumeReportExport(type: $type, ${listParamsValue})
  }
`;

const insightActivityReportExport = `
  query insightActivityReportExport(${listParamsDef}) {
    insightActivityReportExport(${listParamsValue})
  }
`;

const insightFirstResponseReportExport = `
  query insightFirstResponseReportExport($type: String, $userId: String, ${listParamsDef}) {
    insightFirstResponseReportExport(type: $type, userId: $userId, ${listParamsValue})
  }
`;

export default {
  main,
  pieChart,
  punchCard,
  firstResponse,
  responseClose,
  responseSummary,
  brands,
  insightVolumeReportExport,
  insightActivityReportExport,
  insightFirstResponseReportExport
};
