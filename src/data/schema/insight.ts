export const types = ``;

const params = `
  integrationIds: String,
  brandIds: String,
  startDate: String,
  endDate: String
`;

const dealParams = `
  pipelineIds: String,
  boardId: String,
  startDate: String,
  endDate: String
  status: String
`;

export const queries = `
  insightsIntegrations(${params}): JSON
  insightsTags(${params}): JSON
  insightsPunchCard(type: String, ${params}): JSON
  insightsTrend(type: String, ${params}): JSON
  insightsSummaryData(type: String, ${params}): JSON
  insightsConversation(${params}): JSON
  insightsFirstResponse(${params}): JSON
  insightsResponseClose(${params}): JSON
  insightVolumeReportExport(type: String, ${params}): JSON
  insightActivityReportExport(${params}): JSON
  insightFirstResponseReportExport(type: String, userId: String, ${params}): JSON
  insightTagReportExport(${params}): JSON

  dealInsightsMain(${dealParams}): JSON
  dealInsightsPunchCard(${dealParams}): JSON
  dealInsightsByTeamMember(${dealParams}): JSON
`;
