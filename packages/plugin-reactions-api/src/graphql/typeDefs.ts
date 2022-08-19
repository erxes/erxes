import { gql } from 'apollo-server-express';

import {
  types as reactionTypes,
  queries as reactionQueries,
  mutations as reactionMutations
} from './schema/reactions';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${await reactionTypes()}
    
    extend type Query {

      ${reactionQueries}
    }
    
    extend type Mutation {
      ${reactionMutations}
    }
  `;
};

export default typeDefs;
