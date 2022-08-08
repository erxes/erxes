import { gql } from 'apollo-server-express';
import Query from './Query';
import Mutation from './Mutation';
import ForumCategory from './ForumCategory';
import ForumPost from './ForumPost';

export default async function genTypeDefs(serviceDiscovery) {
  return gql`
    scalar JSON
    scalar Date

    ${ForumCategory}
    ${ForumPost}

    ${Query}
    ${Mutation}
  `;
}
