import gql from 'graphql-tag';
import { queries, types } from './schema/queries';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${types}
    
    extend type Query {
      ${queries}
    }
  `;
};

export default typeDefs;
