import gql from 'graphql-tag';
import { mutations as meetingMutations, queries } from './schema/meeting';
import { mutations as topicMutations } from './schema/topic';
import {
  mutations as pinnedUserMutations,
  queries as pinnedUserQueries
} from './schema/pinnedUser';

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

  extend type Deal @key(fields: "_id") {
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
    dealIds: [String]
    deals: [Deal]
  }

  type PinnedUsers {
    userId: String
    pinnedUserIds: [String]
    pinnedUsersInfo: [User]
  }
`;

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${types}
    
    extend type Query {
      ${queries}
      ${pinnedUserQueries}
    }
    
    extend type Mutation {
      ${meetingMutations}
      ${topicMutations}
      ${pinnedUserMutations}
    }
  `;
};

export default typeDefs;
