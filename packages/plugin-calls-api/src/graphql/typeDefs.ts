import { gql } from 'apollo-server-express';

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
`;

const queries = `
  callss(typeId: String): [Calls]
  callsTypes: [CallsType]
  callssTotalCount: Int
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
