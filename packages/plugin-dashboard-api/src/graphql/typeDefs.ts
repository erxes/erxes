import { gql } from 'apollo-server-express';

import {
  mutations as DashboardMutations,
  queries as DashboardQueries,
  types as DashboardTypes
} from './dashboardTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${DashboardTypes}

  extend type Query {
    ${DashboardQueries}
  }

  extend type Mutation {
    ${DashboardMutations}
  }
`;

export default typeDefs;
