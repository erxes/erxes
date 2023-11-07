import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, __, withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import List from '../components/List';
import { queries } from '../graphql';
import {
  ReportsListQueryResponse,
  ReportsMutationResponse,
  TypeQueryResponse
} from '../types';

type Props = {
  history: any;
  queryParams: any;

  typeId: string;
};

type FinalProps = {
  reportsListQuery: ReportsListQueryResponse;
} & Props &
  ReportsMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { reportsListQuery, history, typeId, removeReportsMutation } = props;

  if (reportsListQuery.loading) {
    return <Spinner />;
  }

  const { list = [], totalCount = 0 } = reportsListQuery.reportsList || {};

  const removeReports = (reportIds: string[]) => {
    removeReportsMutation({ reportIds })
      .then(() => {
        Alert.success(__('Successfully deleted'));
      })
      .catch((e: Error) => Alert.error(e.message));
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
          variables: { searchValue: queryParams.searchValue || '' },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ListContainer)
);
