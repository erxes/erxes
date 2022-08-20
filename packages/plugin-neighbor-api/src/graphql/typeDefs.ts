import { gql } from 'apollo-server-express';

import {
  types as neighborTypes,
  queries as neighborQueries,
  mutations as neighborMutations
} from './schema/neighbor';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${await neighborTypes()}
    
    extend type Query {

      ${neighborQueries}
    }
    
    extend type Mutation {
      ${neighborMutations}
    }
  `;
};

export default typeDefs;
