import gql from 'graphql-tag';

import {
  types as ebarimtTypes,
  queries as ebarimtQueries,
  mutations as ebarimtMutations
} from './schema/ebarimt';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${ebarimtTypes}
    
    extend type Query {
      ${ebarimtQueries}
    }

    extend type Mutation {
      ${ebarimtMutations}
    }

  `;
};

export default typeDefs;
