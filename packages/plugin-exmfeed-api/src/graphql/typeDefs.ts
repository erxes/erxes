import { gql } from 'apollo-server-express';

import {
  types as exmTypes,
  queries as exmQueries,
  mutations as exmMutations
} from './schema/exmFeed';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${await exmTypes()}
    
    extend type Query {
      ${exmQueries}
    }
    
    extend type Mutation {
      ${exmMutations}
    }
  `;
};

export default typeDefs;
