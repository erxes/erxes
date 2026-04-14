export const callReportsDashboard = `
  query CallReportsDashboard(
    $startDate: String!
    $endDate: String!
    $queueId: String!
    $direction: String
  ) {
    callGetQueueStats(
      startDate: $startDate
      endDate: $endDate
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
