import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import List from '../../components/timeclock/TimeclockList';
import { TimeClockMutationResponse, TimeClockQueryResponse } from '../../types';
import { queries } from '../../graphql';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { mutations } from '../../graphql';
type Props = {
  queryParams: any;
  history: any;

  queryStartDate: string;
  queryEndDate: string;
  queryUserIds: string[];
  queryDepartmentIds: string[];
  queryBranchIds: string[];

  getActionBar: (actionBar: any) => void;
};

type FinalProps = {
  listTimeclocksQuery: TimeClockQueryResponse;
} & Props &
  TimeClockMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { listTimeclocksQuery, extractAllMySqlDataMutation } = props;

  if (listTimeclocksQuery.loading) {
    return <Spinner />;
  }

  const extractAllMySqlData = () => {
    extractAllMySqlDataMutation().then(() => {
      listTimeclocksQuery.refetch();
    });
  };

  const updatedProps = {
    ...props,
    timeclocks: listTimeclocksQuery.timeclocks || [],
    loading: listTimeclocksQuery.loading,
    extractAllMySqlData
  };

  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TimeClockQueryResponse>(gql(queries.list), {
      name: 'listTimeclocksQuery',
      options: ({
        queryStartDate,
        queryEndDate,
        queryUserIds,
        queryDepartmentIds,
        queryBranchIds
      }) => ({
        variables: {
          startDate: queryStartDate,
          endDate: queryEndDate,
          userIds: queryUserIds,
          departmentIds: queryDepartmentIds,
          branchIds: queryBranchIds
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, TimeClockMutationResponse>(
      gql(mutations.extractAllDataFromMySQL),
      {
        name: 'extractAllMySqlDataMutation'
      }
    )
  )(ListContainer)
);
