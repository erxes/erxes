import { gql } from 'apollo-server-express';
import { mutations, queries } from './schema/meeting';

const types = `
  type Meeting {
    _id: String!
    title: String
    description: String
    startDate: Date
    endDate: Date
    location: String
    createdBy: String
    createdAt: Date
    status: String
    companyId: String
    participantIds: [String]
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
