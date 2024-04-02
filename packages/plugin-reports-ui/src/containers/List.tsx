import * as compose from 'lodash.flowright';

import { Alert, __, confirm, withProps } from '@erxes/ui/src/utils';
import { ReportsListQueryResponse, ReportsMutationResponse } from '../types';
import { mutations, queries } from '../graphql';

import List from '../components/List';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql, useQuery, useMutation } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  queryParams: any;

  typeId: string;
  ids?: string[];
};

const generateParams = (queryParams) => {
  return {
    ...generatePaginationParams(queryParams),
    searchValue: queryParams.searchValue,
    tag: queryParams.tag,
    departmentId: queryParams.departmentId,
  };
};

const ListContainer = (props: Props) => {
  const { queryParams, ids } = props;

  const reportsListQuery = useQuery<ReportsListQueryResponse>(
    gql(queries.reportsList),
    {
      variables: generateParams(queryParams),
      fetchPolicy: 'network-only',
    },
  );

  const [reportsRemoveManyMutation] = useMutation<ReportsMutationResponse>(
    gql(mutations.reportsRemoveMany),
    {
      variables: { ids },
      fetchPolicy: 'network-only',
      refetchQueries: ['reportsList'],
    },
  );

  if (reportsListQuery.loading) {
    return <Spinner />;
  }

  const { list = [], totalCount = 0 } =
    (reportsListQuery.data && reportsListQuery.data.reportsList) || {};

  const removeReports = (ids: string[], callback?: any) => {
    confirm(__('Are you sure to delete selected reports?')).then(() => {
      reportsRemoveManyMutation({ variables: { ids } })
        .then(() => {
          Alert.success(__('Successfully deleted'));
          if (callback) {
            callback();
          }
        })
        .catch((e: Error) => Alert.error(e.message));
    });
  };

  const updatedProps = {
    ...props,

    totalCount,
    reports: list,
    loading: reportsListQuery.loading,
    removeReports,
  };

  return <List {...updatedProps} />;
};

export default ListContainer;
