import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import React from 'react';
import ReportList from '../../components/report/ReportList';
import { queries } from '../../graphql';
import { BranchesQueryResponse, ReportsQueryResponse } from '../../types';
import { IBranch } from '@erxes/ui/src/team/types';

type Props = {
  history: any;
  queryParams: any;
  searchValue?: string;
  departmentIds?: string[];
  branchIds?: string[];
  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  branchesList: IBranch[];
};

type FinalProps = {
  listBranchesQuery: BranchesQueryResponse;
  listReportsQuery: ReportsQueryResponse;
} & Props;

const ListContainer = (props: FinalProps) => {
  const {
    listBranchesQuery,
    listReportsQuery,
    queryParams,
    getActionBar,
    showSideBar
  } = props;
  const { branchId, deptId } = queryParams;

  const updatedProps = {
    ...props,
    getActionBar,
    branchesList: listBranchesQuery.branches || [],
    reports: listReportsQuery.timeclockReports || [],
    branchId,
    deptId
  };
  showSideBar(true);
  return <ReportList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
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
