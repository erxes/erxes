const listParamsDef = `
  $integrationIds: String,
  $brandIds: String,
  $startDate: String,
  $endDate: String
`;

const listParamsValue = `
  integrationIds: $integrationIds,
  brandIds: $brandIds,
  startDate: $startDate,
  endDate: $endDate
`;

const pieChart = `
  query insights(${listParamsDef}) {
    insights(${listParamsValue})
  }
`;

const punchCard = `
  query insightsPunchCard($type: String, ${listParamsDef}) {
    insightsPunchCard(type: $type, ${listParamsValue})
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

const insightTagReportExport = `
  query insightTagReportExport(${listParamsDef}) {
    insightTagReportExport(${listParamsValue})
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
  insightFirstResponseReportExport,
  insightTagReportExport
};
