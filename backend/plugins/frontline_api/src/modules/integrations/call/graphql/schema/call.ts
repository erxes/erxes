const integrationCommonFields = `
    _id: String
    inboxId: String
    phone: String
    wsServer: String
    operators: JSON
    queues: [String]
    srcTrunk: String
    dstTrunk: String
`;
const pageParams = `skip: Int, limit: Int`;

const commonCommentAndMessageFields = `
  content: String
  conversationId: String
`;

export const types = `

  type CallsIntegrationDetailResponse {
    ${integrationCommonFields}
  }

  input CallIntegrationConfigs {
    ${integrationCommonFields}
  }

  type CallChannel {
    _id: String!
    name: String!
    description: String
    integrationIds: [String]
    memberIds: [String]
    createdAt: Date
    userId: String!
    conversationCount: Int
    openConversationCount: Int

    members: [User]
  }

  type CallConversation {
    _id: String
    erxesApiId: String
    integrationId: String
    customerPhone: String
    operatorPhone: String
    callId: String
    channels: [CallChannel]
  }

  type CallConversationDetail {
    customer: Customer
    channels: [CallChannel]
  }
  type CallActiveSession {
    _id: String
    userId: String
    lastLoginDeviceId: String
  }
   type CallHistory{
    _id: String
    operatorPhone: String
    customerPhone: String
    callDuration: Int
    callStartTime: Date
    callEndTime: Date
    callType: String
    callStatus: String
    timeStamp: Float
    modifiedAt: Date
    createdAt: Date
    createdBy: String
    modifiedBy: String
    customer: Customer
    extensionNumber: String
    conversationId: String
    recordUrl: String
    inboxIntegrationId: String
    acctId: String
    uniqueid: String
  }

  type CallSessionOperator {
    userId: String
    extensionNumber: String
    state: String
    ringedAt: Date
    answeredAt: Date
  }

  type CallSession {
    _id: String
    uniqueid: String!
    inboxIntegrationId: String
    conversationId: String
    customerId: String
    customerPhone: String
    operatorPhone: String
    callType: String
    status: String
    queueName: String
    ringingOperators: [CallSessionOperator]
    answeredBy: String
    answeredExtension: String
    startedAt: Date
    answeredAt: Date
    endedAt: Date
    durationSec: Int
    hangupCause: String
    source: String
    cdrAcctId: String
    recordUrl: String
    diversion: String
    createdAt: Date
    updatedAt: Date
  }

  type CallStatistic {
    extension: String
    queuename: String
    strategy: String
    callstotal: Int
    callswaiting: Int
    callscomplete: Int
    callsabandoned: Int
    servicelevel: String
    urgemsg: Int
    newmsg: Int
    oldmsg: Int
    queuechairman: String
    enable_agent_login: String
    abandonedrate: String
    avgwaittime: Int
    avgtalktime: Int
    availablecount: Int
    agentcount: Int
  }

  type CallQueueStatistics {
    queuechairman: String
    queue: Int
    totalCalls: Int
    answeredCalls: Int
    answeredRate: Float
    abandonedCalls: Int
    avgWait: Float
    avgTalk: Float
    vqTotalCalls: Int
    slaRate: Float
    vqSlaRate: Float
    abandonedRate: Float
    createdAt: String
    updatedAt: String
  }

  type CallAgent {
    extension: String
    member: [AgentMember]
    idlecount: Int
  }

  type AgentMember {
    member_extension: String
    status: String # InUse, Idle, Paused
    membership: String
    answer: Int
    abandon: Int
    logintime: String
    talktime: Int
    pausetime: String
    first_name: String
    last_name: String
    queue_action: String
    pause_reason: String
    # For hangup events
    callerchannel: String
    calleechannel: String
    calleeid: String
  }

  type CallConversationNotes {
    _id: String!
    ${commonCommentAndMessageFields}
    attachments: [Attachment]
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    mid: String
    internal: Boolean
    customer: Customer
    user: User
  }

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

  type CallLog {
    _id: ID
    src: String
    dst: String
    start: Date
    duration: Int
    disposition: String
  }

  type PaginatedCallLogs {
    calls: [CallLog]
    totalCount: Int
    totalPages: Int
  }

  input CallLogFilter {
    startDate: Date!
    endDate: Date!
    operatorId: String
    status: String
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
`;

export const subscriptions = `
  sessionTerminateRequested(userId: String): JSON
  queueRealtimeUpdate(extension: String): String

  callStatistic(extension: String): CallStatistic
  `;

const mutationFilterParams = `
  callStatus: String
  callType: String
  startDate: String
  endDate: String
  integrationId: String
  searchValue: String
`;

const filterParams = `
  limit: Int,
  ${mutationFilterParams}
`;

export const queries = `
  callSessionDetail(uniqueid: String, conversationId: String): CallSession
  callActiveSessions(inboxIntegrationId: String!, extension: String): [CallSession]
  callsIntegrationDetail(integrationId: String!): CallsIntegrationDetailResponse
  callUserIntegrations: [CallsIntegrationDetailResponse]
  callsCustomerDetail(customerPhone: String): Customer
  callsActiveSession: CallActiveSession
  callHistories(${filterParams}, skip: Int): [CallHistory]
  callHistoriesTotalCount(${filterParams}, skip: Int): Int
  callsGetConfigs: JSON
  callGetAgentStatus: String
  callExtensionList(integrationId: String!): JSON
  callQueueList(integrationId: String!): JSON
  callQueueInitialList(queue: String!): String
  callTodayStatistics(queue: String!): CallKeyStatistics
  callCalculateServiceLevel(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateFirstCallResolution(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateAbandonmentRate(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateAverageSpeedOfAnswer(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateAverageHandlingTime(queue: String!, startDate: String!, endDate: String!, direction: String): Float
  callCalculateOccupancyRate(queue: String!, startDate: String!, endDate: String!, direction: String): Float

  callConversationNotes(conversationId: String! getFirst: Boolean, ${pageParams}): [CallConversationNotes]
  callHistoryDetail(_id: String, conversationId: String): CallHistory
  callGetQueueStats(startDate: String!, endDate: String!, queueId: String, direction: String): [QueueStats!]!
  callGetAgentStats(startDate: String!,endDate: String!, queueId: String, agentId: String, direction: String): [AgentStats!]!
  getCallbackStats(startDate: String!, endDate: String!, queueId: String): [CallbackStats!]!
  callGetOperatorStats(startDate: Date!, endDate: Date!): [OperatorStat]
  callKpiScorecard(startDate: String!, endDate: String!, queueId: String, direction: String): CallKeyStatistics
  callVolumeSeries(startDate: String!, endDate: String!, queueId: String, direction: String): [CallVolumePoint]
  callCarrierBreakdown(startDate: String!, endDate: String!, queueId: String, direction: String): [CarrierSlice]
  callHeatmap(startDate: String!, endDate: String!, queueId: String, direction: String): [HeatCell]
  callTopNumbers(startDate: String!, endDate: String!, queueId: String, direction: String, limit: Int): [TopNumber]
  `;

export const mutations = `
  callsIntegrationUpdate(configs: CallIntegrationConfigs): JSON
  callAddCustomer(inboxIntegrationId: String, primaryPhone: String, queueName: String): CallConversationDetail
  callUpdateActiveSession: JSON
  callsUpdateConfigs(configsMap: JSON!): JSON
  callsPauseAgent(status: String!, integrationId: String!): String
  callTransfer(extensionNumber: String!, integrationId: String!, direction: String): String
  callSyncRecordFile(acctId: String!, inboxId: String!): String

`;
