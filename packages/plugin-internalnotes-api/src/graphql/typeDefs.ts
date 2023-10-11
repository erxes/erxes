import gql from 'graphql-tag';

import { types, queries, mutations } from './schema/internalNote';

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
