import { gql } from 'apollo-server-express';
import Query from './Query';
import Mutation from './Mutation';
import ForumCategory from './ForumCategory';
import ForumPost from './ForumPost';
import ForumComment from './ForumComment';
import { POSSIBLE_STATES } from '../../db/models/post';

export default async function genTypeDefs(serviceDiscovery) {
  return gql`
    scalar JSON
    scalar Date

    enum ForumPostState {
      ${POSSIBLE_STATES.join('\n')}
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
