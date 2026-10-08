const integrationCommonFields = `
    _id: String
    inboxId: String
    phone: String
    wsServer: String
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

  type CallOperator {
    userId: String
    gsUsername: String
    gsPassword: String
    gsForwardAgent: Boolean
  }

  type CallsIntegrationDetailResponse {
    ${integrationCommonFields}
    operators: [CallOperator]
    name: String
  }

  input CallIntegrationConfigs {
    ${integrationCommonFields}
    operators: JSON
  }

  type CallConfig {
    _id: String!
    code: String
    value: JSON
  }

  type CallExtension {
    extension: String
    fullname: String
    status: String
  }

  type CallQueueStatistic {
    queue: String
    integrationId: String
    queuechairman: String
    totalCalls: Int
    answeredCalls: Int
    answeredRate: Float
    abandonedCalls: Int
    abandonedRate: Float
    avgWait: Float
    avgTalk: Float
    vqTotalCalls: Int
    slaRate: Float
    vqSlaRate: Float
    transferOutCalls: Int
    transferOutRate: Float
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

  type CallConversationIntegration {
    _id: String!
    name: String
  }

  type CallConversationDetail {
    customer: Customer
    channels: [CallChannel]
    integration: CallConversationIntegration
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
  callsIntegrationDetail(integrationId: String!): CallsIntegrationDetailResponse
  callUserIntegrations: [CallsIntegrationDetailResponse]
  callsCustomerDetail(customerPhone: String): Customer
  callHistories(${filterParams}, skip: Int): [CallHistory]
  callHistoriesTotalCount(${filterParams}, skip: Int): Int
  callsGetConfigs: [CallConfig]
  callGetAgentStatus: String
  callExtensionList(integrationId: String!): [CallExtension]
  callQueueList(integrationId: String!): [CallQueueStatistic]
  callQueueInitialList(queue: String!): String

  callConversationNotes(conversationId: String! getFirst: Boolean, ${pageParams}): [CallConversationNotes]
  callHistoryDetail(_id: String, conversationId: String): CallHistory
  `;

export const mutations = `
  callsIntegrationUpdate(configs: CallIntegrationConfigs): JSON
  callAddCustomer(inboxIntegrationId: String, primaryPhone: String, queueName: String): CallConversationDetail
  callsUpdateConfigs(configsMap: JSON!): JSON
  callsPauseAgent(status: String!, integrationId: String!): String
  callTransfer(extensionNumber: String!, integrationId: String!, direction: String): String
  callSyncRecordFile(acctId: String!, inboxId: String!): String

`;
