import gql from 'graphql-tag';
import {
  types as categoryTypes,
  inputs as categoryInputs,
  queries as categoryQueries,
  mutations as categoryMutations,
} from './schemas/category';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${categoryTypes}

    ${categoryInputs}
    
    extend type Query {
      ${categoryQueries}
    }
    
    extend type Mutation {
      ${categoryMutations}
    }
  `;
};

export default typeDefs;
