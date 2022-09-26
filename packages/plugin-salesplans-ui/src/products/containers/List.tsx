import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';
import { DataWithLoader } from '@erxes/ui/src';
import gql from 'graphql-tag';
import queryString from 'query-string';
import ListComponent from '../components/List';

const ListContainer = () => {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const { salesLogId = '', categoryId = '' } = query;

  const timeframesQuery = useQuery(gql(queries.timeframes));
  const salesLogQuery = useQuery(gql(queries.salesLogDetail), {
    variables: { salesLogId },
    notifyOnNetworkStatusChange: true
  });
  const productsQuery = useQuery(gql(queries.products), {
    variables: { categoryId },
    notifyOnNetworkStatusChange: true
  });

  useEffect(() => {
    productsQuery.refetch();
    salesLogQuery.refetch();
  }, [categoryId]);

  return (
    <DataWithLoader
      data={
        <ListComponent
          products={productsQuery.data ? productsQuery.data.products : []}
          timeframes={
            timeframesQuery.data ? timeframesQuery.data.timeframes : []
          }
          data={salesLogQuery.data ? salesLogQuery.data.salesLogDetail : {}}
          refetch={salesLogQuery.refetch}
        />
      }
      loading={salesLogQuery.loading}
    />
  );
};

export default ListContainer;
