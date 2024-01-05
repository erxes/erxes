import gql from 'graphql-tag';

const types = `
  type Syncpolaris {
    _id: String!
    name: String
  }
`;

const queries = `
  syncpolariss(typeId: String): [Syncpolaris]
`;

const params = `
  name: String,
`;

const mutations = `
  syncpolarissAdd(${params}): Syncpolaris
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
