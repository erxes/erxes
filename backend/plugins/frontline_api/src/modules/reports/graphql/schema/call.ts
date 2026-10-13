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
    noAnswer: Int
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
    noAnswer: Int
    answerRate: Float
  }

  type CallDayHourCell {
    day: Date
    hour: Int
    total: Int
    answered: Int
    noAnswer: Int
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

  type CallReportIntegration {
    _id: String
    inboxId: String
    phone: String
    queues: [String]
  }

  type CallHistoryEntry {
    uniqueid: String!
    startedAt: Date
    endedAt: Date
    customerPhone: String
    customerName: String
    customerId: String
    carrier: String
    direction: String
    outcome: String
    isAnswered: Boolean
    waitTime: Float
    talkTime: Int
    agentExtension: String
    agentName: String
    rungCount: Int
    queue: String
    recordUrl: String
    conversationId: String
    repeatCount: Int
    repeatAnswered: Int
  }

  type CallSlaTotals {
    totalCalls: Int!
    offeredCalls: Int!
    answeredCalls: Int!
    abandonedCalls: Int!
    shortAbandonedCalls: Int!
    calledBackCalls: Int!
    pendingCallbacks: Int!
    breachedCalls: Int!
    serviceLevel: Float
  }

  type CallSlaQueue {
    queue: String!
    totalCalls: Int!
    offeredCalls: Int!
    answeredCalls: Int!
    abandonedCalls: Int!
    shortAbandonedCalls: Int!
    calledBackCalls: Int!
    pendingCallbacks: Int!
    breachedCalls: Int!
    serviceLevel: Float
  }

  type CallSlaPoint {
    day: Date
    offeredCalls: Int!
    answeredCalls: Int!
    breachedCalls: Int!
    serviceLevel: Float
  }

  type CallSlaBreach {
    uniqueid: String!
    startedAt: Date
    customerPhone: String
    queue: String
    agent: String
    agentName: String
    waitTime: Float!
    isPendingCallback: Boolean!
  }

  type CallMissedReason {
    reason: String!
    count: Int!
    calledBack: Int!
  }

  type CallMissedHour {
    hour: Int!
    reason: String!
    count: Int!
  }

  type CallSlaReport {
    shortAbandonSeconds: Int!
    callbackWindowMinutes: Int!
    agents: [CallHistoryAgent!]!
    missedReasons: [CallMissedReason!]!
    missedByHour: [CallMissedHour!]!
    summary: CallSlaTotals!
    series: [CallSlaPoint!]!
    queues: [CallSlaQueue!]!
    breachCount: Int!
    breaches: [CallSlaBreach!]!
  }

  type CallHistoryAgent {
    extension: String!
    name: String
  }

  type CallHistoryPage {
    entries: [CallHistoryEntry!]!
    totalCount: Int!
    callerCount: Int!
    agents: [CallHistoryAgent!]!
  }
`;

export const queries = `
  callReportIntegrations: [CallReportIntegration!]!
  callGetQueueStats(startDate: String!, endDate: String!, integrationId: String, queueId: String, direction: String): [QueueStats!]!
  callGetAgentStats(startDate: String!, endDate: String!, integrationId: String, queueId: String, agentId: String, direction: String): [AgentStats!]!
  getCallbackStats(startDate: String!, endDate: String!, integrationId: String, queueId: String): [CallbackStats!]!
  callKpiScorecard(startDate: String!, endDate: String!, integrationId: String, queueId: String, direction: String): CallKeyStatistics
  callVolumeSeries(startDate: String!, endDate: String!, integrationId: String, queueId: String, direction: String): [CallVolumePoint]
  callCarrierBreakdown(startDate: String!, endDate: String!, integrationId: String, queueId: String, direction: String): [CarrierSlice]
  callHeatmap(startDate: String!, endDate: String!, integrationId: String, queueId: String, direction: String): [HeatCell]
  callHeatmapDaily(startDate: String!, endDate: String!, integrationId: String, queueId: String, direction: String): [CallDayHourCell]
  callTopNumbers(startDate: String!, endDate: String!, integrationId: String, queueId: String, direction: String, limit: Int): [TopNumber]
  callTodayStatistics(queue: String!): CallKeyStatistics
  callCalculateServiceLevel(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateFirstCallResolution(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateAbandonmentRate(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateAverageSpeedOfAnswer(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateAverageHandlingTime(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateOccupancyRate(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callGetOperatorStats(startDate: Date!, endDate: Date!): [OperatorStat]
  callSlaReport(startDate: String!, endDate: String!, integrationId: String, queueId: String, agentExtension: String, callbackWindowMinutes: Int, breachLimit: Int): CallSlaReport!
  callHistoryList(startDate: String!, endDate: String!, integrationId: String, queueId: String, direction: String, outcome: String, agentExtension: String, resolution: String, searchValue: String, skip: Int, limit: Int): CallHistoryPage
`;
