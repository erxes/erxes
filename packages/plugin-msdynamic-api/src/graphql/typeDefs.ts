import gql from 'graphql-tag';
import { mutations, queries } from './schema/msdynamic';

const types = `
  type SyncHistory {
    _id: String!
    type: String
    contentType: String
    contentId: String
    createdAt: Date
    createdBy: String
    consumeData: JSON
    consumeStr: String
    sendData: JSON
    sendStr: String
    responseData: JSON
    responseStr: String
    error: String
    content: String
    createdUser: JSON
  }
`;

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
