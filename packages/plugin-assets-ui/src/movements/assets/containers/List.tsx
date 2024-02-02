import React from 'react';
import { gql, useQuery } from '@apollo/client';
import MovementItem from '../components/List';
import { queries } from '../graphql';
import {
  MovementItemsQueryResponse,
  MovementItemsTotalCountQueryResponse,
} from '../../../common/types';
import { generateParams } from '../../../common/utils';

type Props = { queryParams: any; history: any };

const MovementItemsContainer = (props: Props) => {
  const { history, queryParams } = props;

  const itemsQuery = useQuery<MovementItemsQueryResponse>(gql(queries.items), {
    variables: generateParams({ queryParams }),
  });

  const itemsTotalCount = useQuery<MovementItemsTotalCountQueryResponse>(
    gql(queries.itemsTotalCount),
    {
      variables: generateParams({ queryParams }),
    },
  );

  const updatedProps = {
    items: itemsQuery?.data?.assetMovementItems || [],
    totalCount: itemsTotalCount?.data?.assetMovementItemsTotalCount || 0,
    loading: itemsQuery.loading || itemsTotalCount.loading,
    history,
    queryParams,
  };

  return <MovementItem {...updatedProps} />;
};

export default MovementItemsContainer;
