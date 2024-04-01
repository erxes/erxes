import { Alert, Bulk, router } from '@erxes/ui/src';
import { gql } from '@apollo/client';
import React, { useState } from 'react';

import PeriodLocksList from '../components/PeriodLocksList';
import { mutations, queries } from '../graphql';
import { MainQueryResponse, RemoveMutationResponse } from '../types';
import { useMutation, useQuery } from '@apollo/client';

type Props = {
  queryParams: any;
};

const PeriodLockListContainer = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { queryParams } = props;

  const periodLocksMainQuery = useQuery<MainQueryResponse>(
    gql(queries.periodLocksMain),
    {
      variables: {
        ...router.generatePaginationParams(queryParams || {}),
        ids: queryParams.ids,
        searchValue: queryParams.searchValue,
        sortField: queryParams.sortField,
        sortDirection: queryParams.sortDirection
          ? parseInt(queryParams.sortDirection, 10)
          : undefined,
      },
      fetchPolicy: 'network-only',
    },
  );

  const [periodLocksRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.periodLocksRemove),
    {
      refetchQueries: ['periodLocksMain'],
    },
  );

  const removePeriodLocks = ({ periodLockIds }, emptyBulk) => {
    periodLocksRemove({
      variables: { periodLockIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success('You successfully deleted a periodLock');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const searchValue = queryParams.searchValue || '';
  const { list = [], totalCount = 0 } =
    periodLocksMainQuery?.data?.periodLocksMain || {};

  const updatedProps = {
    ...props,
    totalCount,
    searchValue,
    periodLocks: list,
    loading: periodLocksMainQuery.loading || loading,
    removePeriodLocks,
  };

  const periodLocksList = (props) => {
    return <PeriodLocksList {...updatedProps} {...props} />;
  };

  const refetch = () => {
    periodLocksMainQuery.refetch();
  };

  return <Bulk content={periodLocksList} refetch={refetch} />;
};

export default PeriodLockListContainer;
