
export const callReportsDashboard = `
  query CallReportsDashboard(
    $queue: String!
    $startDate: String! 
    $endDate: String!
    $queueId: String
  ) {
    callTodayStatistics(queue: $queue) {
      serviceLevel
      firstCallResolution
      averageSpeed
      averageAnsweredTime
      callstotal
    }
    callCalculateServiceLevel(queue: $queue, startDate: $startDate, endDate: $endDate)
    callCalculateFirstCallResolution(queue: $queue, startDate: $startDate, endDate: $endDate)
    callCalculateAbandonmentRate(queue: $queue, startDate: $startDate, endDate: $endDate)
    callCalculateAverageSpeedOfAnswer(queue: $queue, startDate: $startDate, endDate: $endDate)
    callCalculateAverageHandlingTime(queue: $queue, startDate: $startDate, endDate: $endDate)
    callCalculateOccupancyRate(queue: $queue, startDate: $startDate, endDate: $endDate)
    callGetQueueStats(startDate: $startDate, endDate: $endDate, queueId: $queueId) {
      queue
      totalCalls
      answeredCalls
      answeredRate
      abandonedCalls
      abandonedRate
      averageWaitTime
      averageTalkTime
    }
    callGetAgentStats(startDate: $startDate, endDate: $endDate, queueId: $queueId) {
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
