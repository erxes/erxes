import { gql } from 'apollo-server-express';

import {
  types as carTypes,
  queries as carQueries,
  mutations as carMutations
} from './schema/car';

const typeDefs = async (_serviceDiscovery) => {
  return gql`
    scalar JSON
    scalar Date
    
    ${carTypes}
    
    extend type Query {
      ${carQueries}
    }
    
    extend type Mutation {
      ${carMutations}
    }
  `;
};

export default typeDefs;
