const integrationCommonFields = `
    _id: String
    inboxId: String
    phone: String
    wsServer: String
    operators: JSON
    token: String
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
    transferoutcalls: Int
    transferoutrate: String
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
    transferOutCalls: Int
    transferOutRate: Float
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
`;

export const subscriptions = `
  sessionTerminateRequested(userId: String): JSON
  waitingCallReceived(extension: String): String
  talkingCallReceived(extension: String): String
  agentCallReceived(extension: String): String
  queueRealtimeUpdate(extension: String): String

  callStatistic(extension: String): CallStatistic
  `;

const commonHistoryFields = `
  operatorPhone: String
  customerPhone: String
  callDuration: Int
  callStartTime: Date
  callEndTime: Date
  callType: String
  callStatus: String
  timeStamp: Float
  inboxIntegrationId: String
  transferredCallStatus: String
  endedBy: String
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
  callsActiveSession: CallActiveSession
  callHistories(${filterParams}, skip: Int): [CallHistory]
  callHistoriesTotalCount(${filterParams}, skip: Int): Int
  callsGetConfigs: JSON
  callGetAgentStatus: String
  callExtensionList(integrationId: String!): JSON
  callQueueList(integrationId: String!): JSON
  callQueueInitialList(queue: String!): String
  callQueueMemberList(integrationId: String!, queue: String!): JSON
  callTodayStatistics(queue: String!): JSON

  callConversationNotes(conversationId: String! getFirst: Boolean, ${pageParams}): [CallConversationNotes]
  callHistoryDetail(_id: String, conversationId: String): CallHistory
  `;

export const mutations = `
  callsIntegrationUpdate(configs: CallIntegrationConfigs): JSON
  callAddCustomer(inboxIntegrationId: String, primaryPhone: String, queueName: String): CallConversationDetail
  callUpdateActiveSession: JSON
  callHistoryAdd(${commonHistoryFields}, queueName: String): CallHistory
  callHistoryEdit(_id: String,${commonHistoryFields}): String
  callHistoryRemove(_id: String!): JSON
  callsUpdateConfigs(configsMap: JSON!): JSON
  callsPauseAgent(status: String!, integrationId: String!): String
  callTransfer(extensionNumber: String!, integrationId: String!, direction: String): String
  callSyncRecordFile(acctId: String!, inboxId: String!): String

`;
