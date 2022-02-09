import { gql } from 'apollo-server-express';

import {
  types as LogTypes,
  queries as LogQueries,
} from './logTypeDefs';

import {
  types as ActivityLogTypes,
  queries as ActivityLogQueries,
} from './activityLogTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${LogTypes}
  ${ActivityLogTypes}

  extend type Query {
    ${LogQueries}
    ${ActivityLogQueries}
  }

  extend type Mutation {
  }
`;

export default typeDefs;
