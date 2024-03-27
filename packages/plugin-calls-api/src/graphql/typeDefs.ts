import gql from 'graphql-tag';

const integrationCommonFields = `
    _id: String
    inboxId: String
    phone: String
    wsServer: String
    operators: JSON
    token: String
`;

const types = `

  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }

   extend type User @key(fields: "_id") {
    _id: String! @external
  }

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
    senderPhoneNumber: String
    recipientPhoneNumber: String
    callId: String
    channels: [CallChannel]
  }

  type CallConversationDetail {
    customer: Customer
    conversation: CallConversation
  }
  type CallActiveSession {
    _id: String
    userId: String
    lastLoginDeviceId: String
  }
   type CallHistory {
    _id: String
    receiverNumber: String
    callerNumber: String
    callDuration: Int
    callStartTime: Date
    callEndTime: Date
    callType: String
    callStatus: String
    sessionId: String
    modifiedAt: Date
    createdAt: Date
    createdBy: String
    modifiedBy: String
    customer: Customer
  }
`;

export const subscriptions = `sessionTerminateRequested(userId: String): JSON`;

const commonHistoryFields = `
  receiverNumber: String
  callerNumber: String
  callDuration: Int
  callStartTime: Date
  callEndTime: Date
  callType: String
  callStatus: String
  sessionId: String
  modifiedAt: Date
  createdAt: Date
  createdBy: String
  modifiedBy: String
`;

const mutationFilterParams = `
  callStatus: String
  callType: String
  startDate: String
  endDate: String
`;

const filterParams = `
  limit: Int,
  ${mutationFilterParams}
`;

const queries = `
  callsIntegrationDetail(integrationId: String!): CallsIntegrationDetailResponse
  callUserIntegrations: [CallsIntegrationDetailResponse]
  callsCustomerDetail(callerNumber: String): Customer
  callsActiveSession: CallActiveSession
  callHistories(${filterParams}, skip: Int): [CallHistory]
`;

const mutations = `
  callsIntegrationUpdate(configs: CallIntegrationConfigs): JSON
  callAddCustomer(inboxIntegrationId: String, primaryPhone: String, direction: String, callID: String): CallConversationDetail
  callUpdateActiveSession: JSON
  callTerminateSession: JSON
  callDisconnect: String
  callHistoryAdd(${commonHistoryFields}): CallHistory
  callHistoryEdit(${commonHistoryFields}): CallHistory
  callHistoryRemove(_id: String!): JSON
`;

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${types}
    
    extend type Query {
      ${queries}
    }
    
    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
