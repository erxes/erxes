import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import React from 'react';
import ReportList from '../components/report/ReportList';
import { queries } from '../graphql';
import { BranchesQueryResponse, ReportsQueryResponse } from '../types';
import erxesQuery from '@erxes/ui/src/team/graphql/queries';

type Props = {
  history: any;
  queryParams: any;
  searchValue: string;
  departmentIds: string[];
  branchIds: string[];
};

type FinalProps = {
  listBranchesQuery: BranchesQueryResponse;
  listReportsQuery: ReportsQueryResponse;
} & Props;

const ListContainer = (props: FinalProps) => {
  const { listBranchesQuery, listReportsQuery, queryParams } = props;
  const { branchId, deptId } = queryParams;

  const updatedProps = {
    ...props,
    branchesList: listBranchesQuery.branches || [],
    reports: listReportsQuery.timeclockReports || [],
    branchId,
    deptId
  };
  return <ReportList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BranchesQueryResponse, { searchValue: string }>(
      gql(erxesQuery.branches),
      {
        name: 'listBranchesQuery',
        options: ({ searchValue }) => ({
          variables: { searchValue },
          fetchPolicy: 'network-only'
        })
      }
    ),

    graphql<Props, ReportsQueryResponse>(gql(queries.listReports), {
      name: 'listReportsQuery',
      options: ({ departmentIds, branchIds }) => ({
        variables: {
          departmentIds,
          branchIds
        },
        fetchPolicy: 'network-only'
      })
    })
  )(ListContainer)
);
