import { gql } from 'apollo-server-express';

import {
  types as segmentTypes,
  queries as segmentQueries,
  mutations as segmentMutations
} from './schema/segment';

const typeDefs = async (_serviceDiscovery) => {
  return gql`
    scalar JSON
    scalar Date

    ${segmentTypes}
    
    extend type Query {
      ${segmentQueries}
    }
    
    extend type Mutation {
      ${segmentMutations}
    }
  `;
};

export default typeDefs;
