import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { OrderByCustomersQueryResponse } from '../types';
import OrdersByCustomersCompoenent from '../components/OrderByCustomers';
import queries from '../graphql/queries';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';

const OrdersByCustomers = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const { loading, data } = useQuery<OrderByCustomersQueryResponse>(
    gql(queries.posOrdersByCustomers),
    {
      variables: {
        ...queryParams,
        page: Number(queryParams?.page || ''),
        perPage: Number(queryParams?.perPage || ''),
      },
      fetchPolicy: 'network-only',
    }
  );

  const { posOrderCustomers = [], posOrderCustomersTotalCount = 0 } =
    data || {};

  const updatedProps = {
    list: posOrderCustomers,
    totalCount: posOrderCustomersTotalCount,
    loading,
  };

  return <OrdersByCustomersCompoenent {...updatedProps} />;
};

export default OrdersByCustomers;
