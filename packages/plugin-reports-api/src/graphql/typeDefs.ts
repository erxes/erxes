import gql from 'graphql-tag';

const types = `
  type Reports {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: ReportsType
  }

  type ReportsType {
    _id: String!
    name: String
  }
`;

const queries = `
  reportss(typeId: String): [Reports]
  reportsTypes: [ReportsType]
  reportssTotalCount: Int
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

const mutations = `
  reportssAdd(${params}): Reports
  reportssRemove(_id: String!): JSON
  reportssEdit(_id:String!, ${params}): Reports
  reportsTypesAdd(name:String):ReportsType
  reportsTypesRemove(_id: String!):JSON
  reportsTypesEdit(_id: String!, name:String): ReportsType
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
