import gql from 'graphql-tag';
import {
  types as lsTypes,
  queries as lsQueries,
  mutations as lsMutations,
} from './schema/active';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${lsTypes()}
    
    extend type Query {

      ${lsQueries}
    }
    
    extend type Mutation {
      ${lsMutations}
    }
  `;
};

export default typeDefs;
