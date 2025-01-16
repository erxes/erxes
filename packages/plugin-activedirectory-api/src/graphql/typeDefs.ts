import gql from 'graphql-tag';
import {
  types as adTypes,
  queries as adQueries,
  mutations as adMutations,
} from './schema/active';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${adTypes()}
    
    extend type Query {

      ${adQueries}
    }
    
    extend type Mutation {
      ${adMutations}
    }
  `;
};

export default typeDefs;
