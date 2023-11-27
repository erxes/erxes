import gql from 'graphql-tag';

const types = `
  type ZmsDictionary {
    _id: String,
    parentId: String,
    name: String,
    code: String,
    type: String,
    isParent: Boolean,
    createdAt: Date,
    createdBy: String
  }
`;

const queries = `
  getZmsDictionary(_id:String!): ZmsDictionary
  getDictionaries(isParent: Boolean, parentId: String): [ZmsDictionary]
  
`;

const params = `
  parentId: String,
  name: String,
  code: String,
  type: String,
  isParent: Boolean,
  createdAt: Date,
  createdBy: String,
`;

const mutations = `
  createZmsDictionary(${params}): ZmsDictionary
  zmsDictionaryEdit(_id: String!, ${params}): JSON
  zmsDictionaryRemove(_id: String!, ${params}): JSON
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
