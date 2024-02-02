import { Alert, Bulk, confirm } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { gql, useQuery, useMutation } from '@apollo/client';
import React from 'react';
import {
  MovementQueryResponse,
  MovementsTotalCountQueryResponse,
} from '../../../common/types';
import { generateParams, movementRefetchQueries } from '../../../common/utils';
import List from '../components/List';
import { mutations, queries } from '../graphql';

type Props = { queryParams: any; history: string } & IRouterProps;

const ListContainer = (props: Props) => {
  const { queryParams } = props;

  const movementsQuery = useQuery<MovementQueryResponse>(
    gql(queries.movements),
    {
      variables: generateParams({ queryParams }),
    },
  );

  const movementsTotalCountQuery = useQuery<MovementsTotalCountQueryResponse>(
    gql(queries.movementsTotalCount),
    {
      variables: generateParams({ queryParams }),
    },
  );

  const [movementRemove] = useMutation(gql(mutations.movementRemove), {
    refetchQueries: movementRefetchQueries(queryParams),
  });

  const remove = (ids: string[]) => {
    confirm()
      .then(() => {
        movementRemove({ variables: { ids } }).then(() => {
          Alert.success('Removed movement');
        });
      })
      .catch((error) => Alert.error(error.message));
  };

  const renderList = (bulkProps) => {
    const updateProps = {
      ...props,
      movements: movementsQuery?.data?.assetMovements || [],
      totalCount: movementsTotalCountQuery?.data?.assetMovementTotalCount,
      loading: movementsQuery.loading,
      remove,
    };

    return <List {...bulkProps} {...updateProps} />;
  };

  const refetch = () => {
    movementsQuery.refetch();
    movementsTotalCountQuery.refetch();
  };

  return <Bulk content={renderList} refetch={refetch} />;
};

export default ListContainer;
