import { gql, useQuery, useMutation } from '@apollo/client';
import { Alert, confirm, Bulk, router } from '@erxes/ui/src';
import React, { useEffect } from 'react';
import {
  PosListQueryResponse,
  RemoveMutationResponse,
} from '../../types';

import { queries, mutations } from '../graphql';
import List from '../components/List';
import { useLocation } from 'react-router-dom';

type Props = {
  queryParams: any;
};

const ListContainer = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  
  const shouldRefetchList = router.getParam(location, 'refetchList');

  const posListQuery = useQuery<PosListQueryResponse>(gql(queries.posList), {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      status: queryParams.status,
      sortField: queryParams.sortField,
      sortDirection: queryParams.sortDirection
        ? parseInt(queryParams.sortDirection, 10)
        : undefined,
    },
    fetchPolicy: 'network-only',
  });

  const [posRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.posRemove),
  );

  useEffect(() => {
    refetch();
  }, [queryParams.page]);

  useEffect(() => {
    if (shouldRefetchList) {
      refetch();
    }
  }, [shouldRefetchList]);

  const refetch = () => {
    posListQuery.refetch();
  };

  const remove = (posId: string) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      posRemove({
        variables: { _id: posId },
      })
        .then(() => {
          // refresh queries
          refetch();

          Alert.success('You successfully deleted a pos.');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const content = (bulkProps) => {
    const posList = posListQuery?.data?.posList || [];
    const totalCount = posList.length || 0;

    const updatedProps = {
      ...props,
      posList,
      remove,
      loading: posListQuery.loading,
      totalCount,
      refetch,
    };

    return <List {...updatedProps} {...bulkProps} />;
  };

  return <Bulk content={content} refetch={refetch} />;
};

export default ListContainer;
