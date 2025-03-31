import gql from 'graphql-tag';

const integrationCommonFields = `
    _id: String
    erxesApiId: String
`;

const types = `

  type CloudflareCallDepartment {
    _id: String!
    name: String!
    operators: JSON
  }

  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }

   extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type CloudflareCallsIntegrationDetailResponse @key(fields: "_id") {
    ${integrationCommonFields}
    departments: [CloudflareCallDepartment]
    isReceiveWebCall: Boolean
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
   type CallHistory {
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
    extentionNumber: String
    conversationId: String
    recordUrl: String
  }

  type CloudflareCall {
    callerNumber: String
    roomState: String
    sessionId: String
    trackName: String
    audioTrack: String
    conversationId: String
  }

  type CloudflareIntegrationDetail {
    name: String
    createdDate: Date
    isActive: Boolean
  }
  type CloudflareIntegration {
    _id: String
    erxesApiId: String
    integrationDetail: CloudflareIntegrationDetail
    operators: JSON
    name: String
  }
`;

export const subscriptions = `
  cloudflareReceiveCall(roomState: String, userId: String, audioTrack: String): CloudflareCall
  cloudflareReceivedCall(roomState: String, audioTrack: String): CloudflareCall
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
  transferedCallStatus: String
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

const queries = `
  cloudflareCallsIntegrationDetail(integrationId: String!): CloudflareCallsIntegrationDetailResponse
  cloudflareCallsUserIntegrations: [CloudflareCallsIntegrationDetailResponse]
  cloudflareCallsCustomerDetail(customerPhone: String): Customer
  cloudflareCallsHistories(${filterParams}, skip: Int): [CallHistory]
  cloudflareCallsHistoriesTotalCount(${filterParams}, skip: Int): Int
  cloudflareCallsGetConfigs: JSON
  cloudflareCallsGetIntegrations: [CloudflareIntegration]
  `;

const mutations = `
  cloudflareMakeCall(callerNumber: String!,callerEmail: String, roomState: String!, audioTrack: String!, integrationId: String!, departmentId: String!): String
  cloudflareAnswerCall(roomState: String!, audioTrack: String!, customerAudioTrack: String!): String
  cloudflareLeaveCall(originator: String, duration: Int, audioTrack: String!): String
  cloudflareCallsUpdateConfigs(configsMap: JSON!): JSON
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
