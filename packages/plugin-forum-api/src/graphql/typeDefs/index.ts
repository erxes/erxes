import { gql } from 'apollo-server-express';
import Query from './Query';
import Mutation from './Mutation';
import ForumCategory from './ForumCategory';
import ForumPost from './ForumPost';
import ForumComment from './ForumComment';

export default async function genTypeDefs(serviceDiscovery) {
  return gql`
    scalar JSON
    scalar Date

    enum ForumPostState {
      DRAFT
      PUBLISHED
    }

    extend type User @key(fields: "_id") {
      _id: String! @external
    }

    ${ForumCategory}
    ${ForumPost}
    ${ForumComment}

    ${Query}
    ${Mutation}
  `;
}
