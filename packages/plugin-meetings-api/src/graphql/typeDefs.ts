import gql from 'graphql-tag';
import { mutations as meetingMutations, queries } from './schema/meeting';
import { mutations as topicMutations } from './schema/topic';

const types = `
  type Topic {
    _id: String
    title: String
    description: String
    ownerId: String 
  }

  extend type User @key(fields: "_id") {
        _id: String! @external
      }

  extend type Company @key(fields: "_id") {
        _id: String! @external
      }

  type Meeting {
    _id: String
    title: String
    description: String
    startDate: Date
    endDate: Date
    location: String
    createdBy: String
    createdAt: Date
    status: String
    companyId: String
    method: String
    participantIds: [String]
    topics: [Topic]
    participantUser: [User]
    createdUser: User
    company: Company
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
      ${meetingMutations}
      ${topicMutations}
    }
  `;
};

export default typeDefs;
