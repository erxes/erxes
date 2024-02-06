import gql from 'graphql-tag';

import {
  types as packegeTypes,
  queries as packageQueries,
  mutations as packageMutations,
} from './schema/packages';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${packegeTypes}
    
    extend type Query {
      ${packageQueries}
    }
    
    extend type Mutation {
      ${packageMutations}
    }
  `;
};

export default typeDefs;
