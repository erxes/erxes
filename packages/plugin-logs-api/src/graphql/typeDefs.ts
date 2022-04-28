import { gql } from 'apollo-server-express';

import {
  types as LogTypes,
  queries as LogQueries,
} from './logTypeDefs';

import {
  types as EmailDeliveryTypes,
  queries as EmailDeliveryQueries
} from './emailDeliveryTypeDefs';

import {
  types as ActivityLogTypes,
  queries as ActivityLogQueries,
} from './activityLogTypeDefs';

const typeDefs = async(_serviceDiscovery) => {
  return gql`
    scalar JSON
    scalar Date

    extend type User @key(fields: "_id") {
      _id: String! @external
    }

    ${LogTypes}
    ${ActivityLogTypes}
    ${EmailDeliveryTypes}

    extend type Query {
      ${LogQueries}
      ${ActivityLogQueries}
      ${EmailDeliveryQueries}
    }
  `;
}

export default typeDefs;
