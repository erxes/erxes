import { gql } from 'apollo-server-express';
import Query from './Query';
import Mutation from './Mutation';
import ForumCategory from './ForumCategory';
import ForumPost from './ForumPost';
import ForumComment from './ForumComment';
import { POST_STATES } from '../../db/models/post';
import { USER_TYPES } from '../../consts';

export default async function genTypeDefs(serviceDiscovery) {
  return gql`
    scalar JSON
    scalar Date

    enum ForumPostState {
      ${POST_STATES.join('\n')}
    }

    enum ForumUserType {
      ${USER_TYPES.join('\n')}
    }

    extend type User @key(fields: "_id") {
      _id: String! @external
    }

    extend type ClientPortalUser @key(fields: "_id") {
      _id: String! @external
    }

    ${ForumCategory}
    ${ForumPost}
    ${ForumComment}

    ${Query}
    ${Mutation}
  `;
}
