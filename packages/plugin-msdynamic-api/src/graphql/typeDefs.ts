import gql from 'graphql-tag';
import { mutations, queries } from './schema/msdynamic';

const types = `
  type Msdynamic {
    _id: String!
    endPoint: String
    username: String
    password: String
    createdAt:Date
  }
`;

const typeDefs = async _serviceDiscovery => {
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
