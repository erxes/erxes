import gql from 'graphql-tag';

import {
  types as savingTypes,
  queries as savingQueries,
  mutations as savingMutations
} from './schema/saving';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${savingTypes}
    
    extend type Query {
      ${savingQueries}
    }
    
    extend type Mutation {
      ${savingMutations}
    }
  `;
};

export default typeDefs;
