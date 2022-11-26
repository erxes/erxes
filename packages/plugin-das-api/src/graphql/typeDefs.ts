import { gql } from 'apollo-server-express';

const types = `
  type Das {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: DasType
  }

  type DasType {
    _id: String!
    name: String
  }
`;

const queries = `
  dass(typeId: String): [Das]
  dasTypes: [DasType]
  dassTotalCount: Int
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

const mutations = `
  dassAdd(${params}): Das
  dassRemove(_id: String!): JSON
  dassEdit(_id:String!, ${params}): Das
  dasTypesAdd(name:String):DasType
  dasTypesRemove(_id: String!):JSON
  dasTypesEdit(_id: String!, name:String): DasType
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
