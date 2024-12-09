import gql from 'graphql-tag';

import { types as adTypes, mutations as adMutations } from './schema/active';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${adTypes()}
    
    extend type Mutation {
      ${adMutations}
    }
  `;
};

export default typeDefs;
