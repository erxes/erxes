import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';
import { types, queries } from './schema';

export default function getTypeDefs(): DocumentNode {
  return gql`
    scalar JSON
    scalar Date
    ${types}

    type Query {
      ${queries}
    }

    type Subscription {
      ordersOrdered(statuses: [String], customerId: String): Order
      orderItemsOrdered(statuses: [String]): PosOrderItem
  }
`;
}
