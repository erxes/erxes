import { gql } from 'apollo-server-express';

import {
  types as CalendarsTypes,
  queries as CalendarsQueries,
  mutations as CalendarsMutations,
} from './calendarsTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date
  ${CalendarsTypes}
  
  extend type Query {
    ${CalendarsQueries}
  }

  extend type Mutation {
    ${CalendarsMutations}
  }
`;

export default typeDefs;
