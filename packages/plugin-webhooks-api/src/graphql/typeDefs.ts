import { gql } from 'apollo-server-express';
import {
  types as webhookTypes,
  queries as webhookQueries,
  mutations as webhookMutations
} from './schema/webhook';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date
    
    ${webhookTypes}
    
    extend type Query {
      ${webhookQueries}
    }
    
    extend type Mutation {
      ${webhookMutations}
    }
  `;
};

export default typeDefs;
