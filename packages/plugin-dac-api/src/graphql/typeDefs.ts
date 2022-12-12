import { gql } from 'apollo-server-express';

const types = `
  type Dac {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: DacType
  }

  type DacType {
    _id: String!
    name: String
  }
`;

const queries = `
  dac(typeId: String): [Dac]
  dacTypes: [DacType]
  dacTotalCount: Int
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

const mutations = `
  dacAdd(${params}): Dac
  dacRemove(_id: String!): JSON
  dacEdit(_id:String!, ${params}): Dac
  dacTypesAdd(name:String):DacType
  dacTypesRemove(_id: String!):JSON
  dacTypesEdit(_id: String!, name:String): DacType
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
