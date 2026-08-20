export const CALL_HISTORY_LIST = `
  query callHistoryList(
    $startDate: String!
    $endDate: String!
    $integrationId: String
    $queueId: String
    $direction: String
    $outcome: String
    $agentExtension: String
    $resolution: String
    $searchValue: String
    $skip: Int
    $limit: Int
  ) {
    callHistoryList(
      startDate: $startDate
      endDate: $endDate
      integrationId: $integrationId
      queueId: $queueId
      direction: $direction
      outcome: $outcome
      agentExtension: $agentExtension
      resolution: $resolution
      searchValue: $searchValue
      skip: $skip
      limit: $limit
    ) {
      totalCount
      callerCount
      agents {
        extension
        name
      }
      entries {
        uniqueid
        startedAt
        endedAt
        customerPhone
        customerName
        customerId
        carrier
        direction
        outcome
        isAnswered
        waitTime
        talkTime
        agentExtension
        agentName
        rungCount
        queue
        recordUrl
        conversationId
        repeatCount
        repeatAnswered
      }
    }
  }
`;
