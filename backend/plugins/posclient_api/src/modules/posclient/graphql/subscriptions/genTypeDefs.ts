import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';
import { types, queries } from './schema';

export default function getTypeDefs(): DocumentNode {
  return gql`
    scalar Date
    ${types}

    type Query {
      ${queries}
    }

    type Subscription {
      ordersOrdered(posToken: String, statuses: [String], customerId: String): Order
      orderItemsOrdered(posToken: String, statuses: [String]): PosOrderItem
      slotsStatusUpdated(posToken: String): [PosclientSlot]
    }
`;
}
