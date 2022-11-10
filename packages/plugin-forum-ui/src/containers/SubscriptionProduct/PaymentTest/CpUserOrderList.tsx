import React, { FC } from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';

const ORDERS = gql`
  query ForumCpMySubscriptionOrders {
    forumCpMySubscriptionOrders {
      _id
      cpUserId
      createdAt
      invoiceAt
      invoiceId
      multiplier
      price
      unit
    }
  }
`;

const OrderList: FC = () => {
  const { loading, error, data } = useQuery(ORDERS);

  if (loading) return null;

  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  return (
    <div>
      <h1>Orders</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default OrderList;
