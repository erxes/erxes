import { gql } from 'apollo-server-express';

import {
  types as chatTypes,
  queries as chatQueries,
  mutations as chatMutations
} from './schema/chat';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${await chatTypes()}
    
    extend type Query {

      ${chatQueries}
    }
    
    extend type Mutation {
      ${chatMutations}
    }
  `;
};

export default typeDefs;
