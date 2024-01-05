import gql from 'graphql-tag';

const types = `
  type Syncpolaris {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: SyncpolarisType
  }

  type SyncpolarisType {
    _id: String!
    name: String
  }
`;

const queries = `
  syncpolariss(typeId: String): [Syncpolaris]
  syncpolarisTypes: [SyncpolarisType]
  syncpolarissTotalCount: Int
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

const mutations = `
  syncpolarissAdd(${params}): Syncpolaris
  syncpolarissRemove(_id: String!): JSON
  syncpolarissEdit(_id:String!, ${params}): Syncpolaris
  syncpolarisTypesAdd(name:String):SyncpolarisType
  syncpolarisTypesRemove(_id: String!):JSON
  syncpolarisTypesEdit(_id: String!, name:String): SyncpolarisType
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
