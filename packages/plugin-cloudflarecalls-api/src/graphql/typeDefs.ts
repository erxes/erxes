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


   type CloudflareCallHistory {
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
    customerAudioTrack: String
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
  cloudflareCallsHistories(${filterParams}, skip: Int): [CloudflareCallHistory]
  cloudflareCallsHistoriesTotalCount(${filterParams}, skip: Int): Int
  cloudflareCallsGetConfigs: JSON
  cloudflareCallsGetIntegrations: [CloudflareIntegration]
  `;

const mutations = `
  cloudflareMakeCall(callerNumber: String!,callerEmail: String, roomState: String!, audioTrack: String!, integrationId: String!, departmentId: String!): String
  cloudflareAnswerCall(audioTrack: String!, customerAudioTrack: String!): String
  cloudflareLeaveCall(roomState: String, originator: String, duration: Int, audioTrack: String!): String
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
