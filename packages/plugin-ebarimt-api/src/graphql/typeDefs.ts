import {
  mutations as ebarimtMutations,
  queries as ebarimtQueries,
  types as ebarimtTypes
} from './schema/ebarimt';

import gql from 'graphql-tag';

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
