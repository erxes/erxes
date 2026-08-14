export const types = `
  type QueueStats {
    queue: String!
    totalCalls: Int!
    answeredCalls: Int!
    answeredRate: Float!
    abandonedCalls: Int!
    abandonedRate: Float!
    averageWaitTime: Float!
    averageTalkTime: Float!
  }

  type CallKeyStatistics {
    serviceLevel: Float
    firstCallResolution: Float
    averageSpeed: Float
    averageAnsweredTime: Float
    callstotal: Int
    abandonment: Float
    occupancy: Float
    """
    Share of the selected calls that connected, counted in either direction,
    so it stays populated when the report is filtered to outbound only.
    """
    answerRate: Float
  }

  type AgentStats {
    agent: String!
    agentName: String
    totalCalls: Int!
    answeredCalls: Int!
    answeredRate: Float!
    missedCalls: Int!
    missedRate: Float!
    totalTalkTime: Int!
    averageTalkTime: Float!
    totalWaitTime: Int!
    averageWaitTime: Float!
    shortestCall: Int!
    longestCall: Int!
  }

  type CallbackStats {
    queue: String!
    totalMissedCalls: Int!
    callbackAttempts: Int!
    successfulCallbacks: Int!
    callbackRate: Float!
    pendingCallbacks: Int!
    averageCallbackTime: Float!
  }

  type CallVolumePoint {
    day: Date
    incoming: Int
    outgoing: Int
    answered: Int
    abandoned: Int
  }

  type CarrierSlice {
    name: String
    value: Int
  }

  type HeatCell {
    dow: Int
    hour: Int
    total: Int
    answered: Int
    answerRate: Float
  }

  type TopNumber {
    number: String
    carrier: String
    attempts: Int
    answered: Int
    missed: Int
    duration: Int
  }

  type OperatorStat {
    agent: String
    totalIncoming: Int
    incomingAnswered: Int
    incomingMissed: Int
    totalOutgoing: Int
    outgoingAnswered: Int
    totalTalkTime: Int
  }

  """
  A call integration the caller may report on.

  Deliberately narrower than CallsIntegrationDetailResponse: that type carries
  the operator list, and with it every extension's SIP password. A supervisor
  who reads reports without taking calls has no reason to receive those.
  """
  type CallReportIntegration {
    _id: String
    inboxId: String
    phone: String
    queues: [String]
  }

  """
  One call, folded from every CDR leg that shares its uniqueid.
  """
  type CallHistoryEntry {
    uniqueid: String!
    startedAt: Date
    endedAt: Date
    customerPhone: String
    """Resolved from the contact record by phone; null when unknown."""
    customerName: String
    customerId: String
    carrier: String
    direction: String
    """
    ANSWERED, BUSY, NO ANSWER, VOICEMAIL, FAILED or MISSED. Never IVR: a call
    the menu answered and nothing else did is excluded from this list, because
    the PBX files the menu leg as a call of its own and it would double every
    inbound call that reached an agent.
    """
    outcome: String
    isAnswered: Boolean
    """Seconds the caller waited before an agent picked up; null when nobody did."""
    waitTime: Float
    talkTime: Int
    agentExtension: String
    agentName: String
    """How many extensions the PBX rang for this call."""
    rungCount: Int
    queue: String
    recordUrl: String
    conversationId: String
    """Calls from this number inside the selected range, and how many connected."""
    repeatCount: Int
    repeatAnswered: Int
  }

  """An agent who handled or was rung for a call in the selected range."""
  type CallHistoryAgent {
    extension: String!
    name: String
  }

  type CallHistoryPage {
    entries: [CallHistoryEntry!]!
    totalCount: Int!
    """Distinct phone numbers behind those calls."""
    callerCount: Int!
    """
    Agents present in the range before the tab's own filters, so the picker
    keeps its full list after one of them is selected.
    """
    agents: [CallHistoryAgent!]!
  }
`;

export const queries = `
  callReportIntegrations: [CallReportIntegration!]!
  callGetQueueStats(startDate: String!, endDate: String!, queueId: String, direction: String): [QueueStats!]!
  callGetAgentStats(startDate: String!, endDate: String!, queueId: String, agentId: String, direction: String): [AgentStats!]!
  getCallbackStats(startDate: String!, endDate: String!, queueId: String): [CallbackStats!]!
  callKpiScorecard(startDate: String!, endDate: String!, queueId: String, direction: String): CallKeyStatistics
  callVolumeSeries(startDate: String!, endDate: String!, queueId: String, direction: String): [CallVolumePoint]
  callCarrierBreakdown(startDate: String!, endDate: String!, queueId: String, direction: String): [CarrierSlice]
  callHeatmap(startDate: String!, endDate: String!, queueId: String, direction: String): [HeatCell]
  callTopNumbers(startDate: String!, endDate: String!, queueId: String, direction: String, limit: Int): [TopNumber]
  callTodayStatistics(queue: String!): CallKeyStatistics
  callCalculateServiceLevel(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateFirstCallResolution(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateAbandonmentRate(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateAverageSpeedOfAnswer(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateAverageHandlingTime(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateOccupancyRate(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callGetOperatorStats(startDate: Date!, endDate: Date!): [OperatorStat]
  callHistoryList(startDate: String!, endDate: String!, queueId: String, direction: String, outcome: String, agentExtension: String, resolution: String, searchValue: String, skip: Int, limit: Int): CallHistoryPage
`;
