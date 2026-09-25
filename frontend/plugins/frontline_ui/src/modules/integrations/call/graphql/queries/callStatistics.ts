export const callReportsDashboard = `
  query CallReportsDashboard(
    $startDate: String!
    $endDate: String!
    $integrationId: String
    $queueId: String
    $direction: String
  ) {
    callGetQueueStats(
      startDate: $startDate
      endDate: $endDate
      integrationId: $integrationId
      queueId: $queueId
      direction: $direction
    ) {
      queue
      totalCalls
      answeredCalls
      answeredRate
      abandonedCalls
      abandonedRate
      averageWaitTime
      averageTalkTime
    }
    callGetAgentStats(
      startDate: $startDate
      endDate: $endDate
      integrationId: $integrationId
      queueId: $queueId
      direction: $direction
    ) {
      agent
      agentName
      totalCalls
      answeredCalls
      answeredRate
      missedCalls
      missedRate
      totalTalkTime
      averageTalkTime
      totalWaitTime
      averageWaitTime
      shortestCall
      longestCall
    }
  }
`;

export const CALL_KPI_SCORECARD = `
  query CallKpiScorecard($startDate: String!, $endDate: String!, $integrationId: String, $queueId: String, $direction: String) {
    callKpiScorecard(startDate: $startDate, endDate: $endDate, integrationId: $integrationId, queueId: $queueId, direction: $direction) {
      callstotal
      serviceLevel
      abandonment
      averageSpeed
      averageAnsweredTime
      firstCallResolution
      occupancy
    }
  }
`;

export const CALL_VOLUME_SERIES = `
  query CallVolumeSeries($startDate: String!, $endDate: String!, $integrationId: String, $queueId: String, $direction: String) {
    callVolumeSeries(startDate: $startDate, endDate: $endDate, integrationId: $integrationId, queueId: $queueId, direction: $direction) {
      day
      incoming
      outgoing
      answered
      noAnswer
      abandoned
    }
  }
`;

export const CALL_CARRIER_BREAKDOWN = `
  query CallCarrierBreakdown($startDate: String!, $endDate: String!, $integrationId: String, $queueId: String, $direction: String) {
    callCarrierBreakdown(startDate: $startDate, endDate: $endDate, integrationId: $integrationId, queueId: $queueId, direction: $direction) {
      name
      value
    }
  }
`;

export const CALL_HEATMAP = `
  query CallHeatmap($startDate: String!, $endDate: String!, $integrationId: String, $queueId: String, $direction: String) {
    callHeatmap(startDate: $startDate, endDate: $endDate, integrationId: $integrationId, queueId: $queueId, direction: $direction) {
      dow
      hour
      total
      answered
      noAnswer
      answerRate
    }
  }
`;

export const CALL_HEATMAP_DAILY = `
  query CallHeatmapDaily($startDate: String!, $endDate: String!, $integrationId: String, $queueId: String, $direction: String) {
    callHeatmapDaily(startDate: $startDate, endDate: $endDate, integrationId: $integrationId, queueId: $queueId, direction: $direction) {
      day
      hour
      total
      answered
      noAnswer
    }
  }
`;

export const CALL_TOP_NUMBERS = `
  query CallTopNumbers($startDate: String!, $endDate: String!, $integrationId: String, $queueId: String, $direction: String, $limit: Int) {
    callTopNumbers(startDate: $startDate, endDate: $endDate, integrationId: $integrationId, queueId: $queueId, direction: $direction, limit: $limit) {
      number
      carrier
      attempts
      answered
      missed
      duration
    }
  }
`;

export const CALL_CALLBACK_STATS = `
  query GetCallbackStats($startDate: String!, $endDate: String!, $integrationId: String, $queueId: String) {
    getCallbackStats(startDate: $startDate, endDate: $endDate, integrationId: $integrationId, queueId: $queueId) {
      queue
      totalMissedCalls
      callbackAttempts
      successfulCallbacks
      callbackRate
      pendingCallbacks
      averageCallbackTime
    }
  }
`;
