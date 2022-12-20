import { gql } from 'apollo-server-express';

import {
  types as ReportTypes,
  queries as ReportQueries,
  mutations as ReportMutations
} from './reportTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${ReportTypes}

  extend type Query {
    ${ReportQueries}
  }

  extend type Mutation {
    ${ReportMutations}
  }
`;

export default typeDefs;
