import { gql } from 'apollo-server-express';

import { types, queries, mutations, mysqlUserTypes } from './schema';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${types}
    ${mysqlUserTypes}
    extend type Query {
      ${queries}
    }
    
    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
