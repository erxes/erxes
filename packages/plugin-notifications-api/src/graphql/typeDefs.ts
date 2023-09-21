import gql from 'graphql-tag';

import {
  types as NotificationTypes,
  queries as NotificationQueries,
  mutations as NotificationMutations,
} from './notificationTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${NotificationTypes}

  extend type Query {
    ${NotificationQueries}
  }

  extend type Mutation {
    ${NotificationMutations}
  }
`;

export default typeDefs;
