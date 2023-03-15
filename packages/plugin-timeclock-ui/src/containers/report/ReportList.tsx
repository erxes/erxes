import { getEnv, isEnabled, withProps } from '@erxes/ui/src/utils/core';
import queryString from 'query-string';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import React from 'react';
import ReportList from '../../components/report/ReportList';
import { queries } from '../../graphql';
import { BranchesQueryResponse, ReportsQueryResponse } from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generateParams } from '../../utils';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';

type Props = {
  history: any;
  queryParams: any;
  searchValue?: string;

  reportType?: string;

  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;
};

type FinalProps = {
  listBranchesQuery: BranchesQueryResponse;
  listReportsQuery: ReportsQueryResponse;
} & Props;

const ListContainer = (props: FinalProps) => {
  const { listReportsQuery, queryParams } = props;
  const { branchId, deptId } = queryParams;

  if (listReportsQuery && listReportsQuery.loading) {
    return <Spinner />;
  }

  const exportReport = () => {
    const stringified = queryString.stringify({
      ...queryParams
    });

    const { REACT_APP_API_URL } = getEnv();
    window.open(
      `${REACT_APP_API_URL}/pl:timeclock/report-export?${stringified}`
    );
  };

  const { list = [], totalCount = 0 } =
    listReportsQuery?.timeclockReports || {};

  const updatedProps = {
    ...props,
    exportReport,
    reports: list,
    totalCount,
    branchId,
    deptId
  };

  return <ReportList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ReportsQueryResponse>(gql(queries.timeclockReports), {
      name: 'listReportsQuery',
      skip: isEnabled('bichil') || false,
      options: ({ queryParams, reportType }) => ({
        variables: {
          ...generateParams(queryParams),
          reportType
        },
        fetchPolicy: 'network-only'
      })
    })
  )(ListContainer)
);
