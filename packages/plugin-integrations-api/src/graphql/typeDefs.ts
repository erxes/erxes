import { gql } from 'apollo-server-express';

import {
  types as LogTypes,
  queries as LogQueries,
} from './logTypeDefs';

const typeDefs = async(_serviceDiscovery) => {
  return gql`
    scalar JSON
    scalar Date

    extend type User @key(fields: "_id") {
      _id: String! @external
    }

    ${LogTypes}

    extend type Query {
      ${LogQueries}
    }
  `;
}

export default typeDefs;
