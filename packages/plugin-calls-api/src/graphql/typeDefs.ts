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
`;

const queries = `
  callsIntegrationDetail(integrationId: String!): CallsIntegrationDetailResponse
  callIntegrationsOfUser: [CallsIntegrationDetailResponse]
  callsCustomerDetail(callerNumber: String): Customer
`;

const mutations = `
  callsIntegrationUpdate(configs: CallIntegrationConfigs): JSON
  callAddCustomer(inboxIntegrationId: String, primaryPhone: String, direction: String, callID: String): CallConversationDetail
`;

const typeDefs = async _serviceDiscovery => {
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
