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

  type CallsIntegrationDetailResponse {
    ${integrationCommonFields}
  }

  input CallIntegrationConfigs {
    ${integrationCommonFields}
  }

  type CallConversation {
    _id: String 
    erxesApiId: String
    integrationId: String
    senderPhoneNumber: String
    recipientPhoneNumber: String
    callId: String
  }

  type CallConversationDetail {
    customer: Customer
    conversation: CallConversation
  }
  type CallActiveSession {
    _id: String
    userId: String
  }
`;

export const subscriptions = `sessionTerminateRequested(userId: String): JSON`;

const queries = `
  callsIntegrationDetail(integrationId: String!): CallsIntegrationDetailResponse
  callIntegrationsOfUser: [CallsIntegrationDetailResponse]
  callsCustomerDetail(callerNumber: String): Customer
  callsActiveSession: CallActiveSession
`;

const mutations = `
  callsIntegrationUpdate(configs: CallIntegrationConfigs): JSON
  callAddCustomer(inboxIntegrationId: String, primaryPhone: String, direction: String, callID: String): CallConversationDetail
  callUpdateActiveSession: JSON
  callTerminateSession: JSON
  callDisconnect: String
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
