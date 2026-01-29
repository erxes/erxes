
export const callReportsDashboard = `
  query CallReportsDashboard(
    $queue: String!
    $startDate: String! 
    $endDate: String!
    $queueId: String
    $direction: String
  ) {
    callTodayStatistics(queue: $queue) {
      serviceLevel
      firstCallResolution
      averageSpeed
      averageAnsweredTime
      callstotal
    }
    callCalculateServiceLevel(queue: $queue, startDate: $startDate, endDate: $endDate, direction: $direction)
    callCalculateFirstCallResolution(queue: $queue, startDate: $startDate, endDate: $endDate, direction: $direction)
    callCalculateAbandonmentRate(queue: $queue, startDate: $startDate, endDate: $endDate, direction: $direction)
    callCalculateAverageSpeedOfAnswer(queue: $queue, startDate: $startDate, endDate: $endDate, direction: $direction)
    callCalculateAverageHandlingTime(queue: $queue, startDate: $startDate, endDate: $endDate, direction: $direction)
    callCalculateOccupancyRate(queue: $queue, startDate: $startDate, endDate: $endDate, direction: $direction)
    callGetQueueStats(startDate: $startDate, endDate: $endDate, queueId: $queueId, direction: $direction) {
      queue
      totalCalls
      answeredCalls
      answeredRate
      abandonedCalls
      abandonedRate
      averageWaitTime
      averageTalkTime
    }
    callGetAgentStats(startDate: $startDate, endDate: $endDate, queueId: $queueId, direction: $direction) {
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
