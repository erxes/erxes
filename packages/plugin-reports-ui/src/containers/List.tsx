import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, __, confirm, withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { ReportsListQueryResponse, ReportsMutationResponse } from '../types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  history: any;
  queryParams: any;

  typeId: string;
  ids?: string[];
};

type FinalProps = {
  reportsListQuery: ReportsListQueryResponse;
} & Props &
  IRouterProps &
  ReportsMutationResponse;

const generateParams = queryParams => {
  return {
    ...generatePaginationParams(queryParams),
    searchValue: queryParams.searchValue,
    tag: queryParams.tag,
    departmentId: queryParams.departmentId
  };
};

const ListContainer = (props: FinalProps) => {
  const {
    reportsListQuery,
    history,
    typeId,
    reportsRemoveManyMutation
  } = props;

  if (reportsListQuery.loading) {
    return <Spinner />;
  }

  const { list = [], totalCount = 0 } = reportsListQuery.reportsList || {};

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
    removeReports
  };

  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ReportsListQueryResponse, { searchValue: string }>(
      gql(queries.reportsList),
      {
        name: 'reportsListQuery',
        options: ({ queryParams }) => ({
          variables: generateParams(queryParams),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ReportsListQueryResponse, { ids?: string[] }>(
      gql(mutations.reportsRemoveMany),
      {
        name: 'reportsRemoveManyMutation',
        options: ({ ids }) => ({
          variables: { ids },
          fetchPolicy: 'network-only',
          refetchQueries: ['reportsList']
        })
      }
    )
  )(withRouter<IRouterProps>(ListContainer))
);
