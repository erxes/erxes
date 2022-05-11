import { gql } from 'apollo-server-express';

import {
  types as loanTypes,
  queries as loanQueries,
  mutations as loanMutations
} from './schema/loan';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${loanTypes}
    
    extend type Query {
      ${loanQueries}
    }
    
    extend type Mutation {
      ${loanMutations}
    }
  `;
};

export default typeDefs;
