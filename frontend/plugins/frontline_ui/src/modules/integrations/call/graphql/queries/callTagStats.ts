export const CALL_TAG_STATS = `
  query callGetTagStats(
    $startDate: String!
    $endDate: String!
    $queueId: String
    $direction: String
    $agentExtension: String
  ) {
    callGetTagStats(
      startDate: $startDate
      endDate: $endDate
      queueId: $queueId
      direction: $direction
      agentExtension: $agentExtension
    ) {
      tagId
      name
      colorCode
      totalCalls
      answeredCalls
      answeredRate
      missedCalls
      totalTalkTime
      averageTalkTime
      averageWaitTime
      share
    }
  }
`;
