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

const dealParamsDef = `
  $pipelineIds: String,
  $boardId: String,
  $startDate: String,
  $endDate: String
  $status: String
`;

const dealParamsValue = `
  pipelineIds: $pipelineIds,
  boardId: $boardId,
  startDate: $startDate,
  endDate: $endDate
  status: $status
`;

const integrationChart = `
  query insightsIntegrations(${listParamsDef}) {
    insightsIntegrations(${listParamsValue})
  }
`;

const tagChart = `
  query insightsTags(${listParamsDef}) {
    insightsTags(${listParamsValue})
  }
`;

const punchCard = `
  query insightsPunchCard($type: String, ${listParamsDef}) {
    insightsPunchCard(type: $type, ${listParamsValue})
  }
`;

const trend = `
  query insightsTrend($type: String, ${listParamsDef}) {
    insightsTrend(type: $type, ${listParamsValue})
  }
`;

const summaryData = `
  query insightsSummaryData($type: String, ${listParamsDef}) {
    insightsSummaryData(type: $type, ${listParamsValue})
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

const dealInsightsMain = `
  query dealInsightsMain(${dealParamsDef}) {
    dealInsightsMain(${dealParamsValue})
  }
`;

const dealInsightsPunchCard = `
  query dealInsightsPunchCard(${dealParamsDef}) {
    dealInsightsPunchCard(${dealParamsValue})
  }
`;

const dealInsightsByTeamMember = `
  query dealInsightsByTeamMember(${dealParamsDef}) {
    dealInsightsByTeamMember(${dealParamsValue})
  }
`;

const insightsConversationCustomerAvg = `
  query insightsConversationCustomerAvg(${listParamsDef}) {
    insightsConversationCustomerAvg(${listParamsValue})
  }
`;

const insightsConversationInternalAvg = `
  query insightsConversationInternalAvg(${listParamsDef}) {
    insightsConversationInternalAvg(${listParamsValue})
  }
`;

const insightsConversationOverallAvg = `
  query insightsConversationOverallAvg(${listParamsDef}) {
    insightsConversationOverallAvg(${listParamsValue})
  }
`;

const insightsConversationSummary = `
  query insightsConversationSummary(${listParamsDef}) {
    insightsConversationSummary(${listParamsValue})
  }
`;

export default {
  trend,
  summaryData,
  integrationChart,
  tagChart,
  punchCard,
  firstResponse,
  responseClose,
  responseSummary,
  brands,

  insightsConversationCustomerAvg,
  insightsConversationInternalAvg,
  insightsConversationOverallAvg,
  insightsConversationSummary,

  dealInsightsMain,
  dealInsightsPunchCard,
  dealInsightsByTeamMember
};
