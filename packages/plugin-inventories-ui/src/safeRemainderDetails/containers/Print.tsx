import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import queryString from 'query-string';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
// local
import { queries } from '../graphql';
import ListComponent from '../components/Print';
import Spinner from '@erxes/ui/src/components/Spinner';

function ListContainer() {
  // Hooks
  const location = useLocation();
  const { id } = useParams();

  const queryParams = queryString.parse(location.search);

  /**
   * Queries
   */
  const safeRemainderDetailQuery = useQuery(gql(queries.safeRemainderDetail), {
    notifyOnNetworkStatusChange: true,
    variables: { _id: id }
  });

  const safeRemainderItemsCountQuery = useQuery(
    gql(queries.safeRemainderItemsCount),
    {
      fetchPolicy: 'network-only',
      variables: {
        remainderId: id,
        status: queryParams.status,
        diffType: queryParams.diffType,
        productCategoryIds: queryParams.productCategoryIds
      }
    }
  );

  const totalCount =
    (safeRemainderItemsCountQuery.data &&
      safeRemainderItemsCountQuery.data.safeRemainderItemsCount) ||
    0;

  const safeRemainderItemsQuery = useQuery(gql(queries.safeRemainderItems), {
    fetchPolicy: 'network-only',
    variables: {
      remainderId: id,
      status: queryParams.status,
      diffType: queryParams.diffType,
      productCategoryIds: queryParams.productCategoryIds,
      perPage: totalCount,
      page: 1
    }
  });

  if (safeRemainderItemsQuery.loading) {
    return <Spinner objective={true} />;
  }

  /**
   * Definitions
   */
  const safeRemainder =
    (safeRemainderDetailQuery.data &&
      safeRemainderDetailQuery.data.safeRemainderDetail) ||
    {};

  const safeRemainderItems =
    (safeRemainderItemsQuery.data &&
      safeRemainderItemsQuery.data.safeRemainderItems) ||
    [];

  const componentProps = {
    loading: safeRemainderItemsQuery.loading,
    safeRemainder,
    safeRemainderItems,
    totalCount
  };

  return <ListComponent {...componentProps} />;
}

export default compose()(ListContainer);
