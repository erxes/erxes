import { gql, useQuery } from '@apollo/client';
import queryString from 'query-string';
import React from 'react';
import { useLocation } from 'react-router-dom';
import OrdersBySubsCompoenent from '../components/OrdersBySubs';
import queries from '../graphql/queries';
import { OrderBySubsQueryResponse } from '../types';

const OrdersBySubs = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const { loading, data } = useQuery<OrderBySubsQueryResponse>(
    gql(queries.posOrdersBySubs),
    {
      variables: {
        ...queryParams,
        page: Number(queryParams?.page || ''),
        perPage: Number(queryParams?.perPage || '')
      },
      fetchPolicy: 'network-only'
    }
  );

  const { posOrderBySubscriptions = [] } = data || {};

  const updatedProps = {
    list: posOrderBySubscriptions,
    totalCount: 10,
    loading,
    queryParams
  };

  return <OrdersBySubsCompoenent {...updatedProps} />;
};

export default OrdersBySubs;
