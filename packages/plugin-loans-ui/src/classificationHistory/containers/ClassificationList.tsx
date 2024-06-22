import Alert from '@erxes/ui/src/utils/Alert';
import Bulk from '@erxes/ui/src/components/Bulk';
import { router } from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';
import React, { useState } from 'react';

import ClassificationHistoryList from '../components/ClassificationHistoryList';
import { mutations, queries } from '../graphql';
import { MainQueryResponse, RemoveMutationResponse } from '../types';
import { useMutation, useQuery } from '@apollo/client';

type Props = {
  queryParams: any;
};

const ClassificationListContainer = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { queryParams } = props;
  const classifications = useQuery<MainQueryResponse>(
    gql(queries.classifications),
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

  const [classificationRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.classificationRemove),
    {
      refetchQueries: ['classifications'],
    },
  );

  const removeClassificationHistory = ({ classificationIds }, emptyBulk) => {
    classificationRemove({
      variables: { classificationIds },
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
    classifications?.data?.classifications || {};

  const updatedProps = {
    ...props,
    totalCount,
    searchValue,
    classificationHistory: list,
    loading: classifications.loading || loading,
    removeClassificationHistory,
  };

  const classificationHistoryList = (props) => {
    return <ClassificationHistoryList {...updatedProps} {...props} />;
  };

  const refetch = () => {
    classifications.refetch();
  };

  return <Bulk content={classificationHistoryList} refetch={refetch} />;
};

export default ClassificationListContainer;
