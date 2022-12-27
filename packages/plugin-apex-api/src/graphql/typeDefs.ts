import { gql } from 'apollo-server-express';

import {
  types as ReportTypes,
  queries as ReportQueries,
  mutations as ReportMutations
} from './reportTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date

  extend type Company @key(fields: "_id") {
    _id: String! @external
  }

  ${ReportTypes}

  extend type Query {
    ${ReportQueries}
  }

  extend type Mutation {
    ${ReportMutations}
  }
`;

export default typeDefs;
