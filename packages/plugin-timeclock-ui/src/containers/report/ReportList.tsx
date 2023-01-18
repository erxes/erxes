import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import React from 'react';
import ReportList from '../../components/report/ReportList';
import { queries } from '../../graphql';
import { BranchesQueryResponse, ReportsQueryResponse } from '../../types';

type Props = {
  history: any;
  queryParams: any;
  searchValue?: string;

  queryStartDate: string;
  queryEndDate: string;
  queryUserIds: string[];
  queryDepartmentIds: string[];
  queryBranchIds: string[];
  queryPage: number;
  queryPerPage: number;
  reportType?: string;

  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
};

type FinalProps = {
  listBranchesQuery: BranchesQueryResponse;
  listReportsQuery: ReportsQueryResponse;
} & Props;

const ListContainer = (props: FinalProps) => {
  const { listReportsQuery, queryParams, getActionBar, showSideBar } = props;
  const { branchId, deptId } = queryParams;

  const updatedProps = {
    ...props,
    getActionBar,
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
      options: ({
        queryStartDate,
        queryEndDate,
        queryUserIds,
        queryDepartmentIds,
        queryBranchIds,
        queryPage,
        queryPerPage,
        reportType
      }) => ({
        variables: {
          startDate: queryStartDate,
          endDate: queryEndDate,
          userIds: queryUserIds,
          departmentIds: queryDepartmentIds,
          branchIds: queryBranchIds,
          page: queryPage,
          perPage: queryPerPage,
          reportType
        },
        fetchPolicy: 'network-only'
      })
    })
  )(ListContainer)
);
