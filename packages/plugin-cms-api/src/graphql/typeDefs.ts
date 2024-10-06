import gql from 'graphql-tag';
import {
  types as categoryTypes,
  inputs as categoryInputs,
  queries as categoryQueries,
  mutations as categoryMutations,
} from './schemas/category';

import {
  types as postTypes,
  inputs as postInputs,
  queries as postQueries,
  mutations as postMutations,
} from './schemas/post';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${categoryTypes}
    ${postTypes}
   

    ${categoryInputs}
    ${postInputs}
    
    extend type Query {
      ${categoryQueries}
      ${postQueries}
    }
    
    extend type Mutation {
      ${categoryMutations}
      ${postMutations}
    }
  `;
};

export default typeDefs;
