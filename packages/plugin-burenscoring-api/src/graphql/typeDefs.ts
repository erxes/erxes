import gql from 'graphql-tag';
import {queries, types} from './schema/queries';
import {mutations} from './schema/mutations';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${types}
    
    extend type Query {
      ${queries}
    }
    
    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
