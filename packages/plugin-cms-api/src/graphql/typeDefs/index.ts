import { gql } from 'apollo-server-express';

export default async function genTypeDefs(serviceDiscovery) {
  return gql`
    scalar JSON
    scalar Date
    
    extend type Query {
    }
    
    extend type Mutation {
    }
  `;
}
