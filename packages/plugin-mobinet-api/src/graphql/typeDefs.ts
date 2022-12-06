import { gql } from 'apollo-server-express';

const types = `
  type Mobinet {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: MobinetType
  }

  type MobinetType {
    _id: String!
    name: String
  }
`;

const queries = `
  mobinets(typeId: String): [Mobinet]
  mobinetTypes: [MobinetType]
  mobinetsTotalCount: Int
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

const mutations = `
  mobinetsAdd(${params}): Mobinet
  mobinetsRemove(_id: String!): JSON
  mobinetsEdit(_id:String!, ${params}): Mobinet
  mobinetTypesAdd(name:String):MobinetType
  mobinetTypesRemove(_id: String!):JSON
  mobinetTypesEdit(_id: String!, name:String): MobinetType
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
