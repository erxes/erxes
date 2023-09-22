import gql from 'graphql-tag';

import {
  types as DiscussionTypes,
  queries as DiscussionQueries,
  mutations as DiscussionMutations
} from './discussionTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${DiscussionTypes}

  extend type Query {
    ${DiscussionQueries}
  }

  extend type Mutation {
    ${DiscussionMutations}
  }
`;

export default typeDefs;
