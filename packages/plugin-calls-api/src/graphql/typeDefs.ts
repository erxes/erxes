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

  type CallsCustomerType {
    _id: String!
    inboxIntegrationId: String
    primaryPhone: String
    erxesApiId: String
  }
  
  type CallsIntegrationDetailResponse {
    ${integrationCommonFields}
  }

  input CallIntegrationConfigs {
    ${integrationCommonFields}
  }

`;

const queries = `
  callsIntegrationDetail(integrationId: String!): CallsIntegrationDetailResponse
  callIntegrationsOfUser: [CallsIntegrationDetailResponse]
  callsCustomerDetail(callerNumber: String): Customer
`;

const mutations = `

  callsIntegrationUpdate(configs: CallIntegrationConfigs): JSON
  callAddCustomer(inboxIntegrationId: String, primaryPhone: String): CallsCustomerType
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
