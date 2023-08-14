import { gql } from 'apollo-server-express';

const integrationCommonFields = `
_id: String
    inboxId: String
    username: String
    password: String
    phone: String
    wsServer: String
    operatorIds: [String]
    token: String
`;

const types = `
  type Calls {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: CallsType
  }

  type CallsType {
    _id: String!
    name: String
  }

  type CallsIntegrationDetailResponse {
    ${integrationCommonFields}
  }

  input CallIntegrationConfigs {
    ${integrationCommonFields}
  }
`;

const queries = `
  callss(typeId: String): [Calls]
  callsTypes: [CallsType]
  callssTotalCount: Int

  callsIntegrationDetail(integrationId: String!): CallsIntegrationDetailResponse
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

const mutations = `
  callssAdd(${params}): Calls
  callssRemove(_id: String!): JSON
  callssEdit(_id:String!, ${params}): Calls
  callsTypesAdd(name:String):CallsType
  callsTypesRemove(_id: String!):JSON
  callsTypesEdit(_id: String!, name:String): CallsType

  callsIntegrationUpdate(configs: CallIntegrationConfigs): JSON
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
