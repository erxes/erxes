import { getEnv, isEnabled, withProps } from '@erxes/ui/src/utils/core';
import queryString from 'query-string';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import React from 'react';
import ReportList from '../../components/report/ReportList';
import { queries } from '../../graphql';
import { BranchesQueryResponse, ReportsQueryResponse } from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generateParams } from '../../utils';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  history: any;
  queryParams: any;
  searchValue?: string;
  isCurrentUserAdmin: boolean;

  reportType?: string;
  currentUser: IUser;

  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;
};

type FinalProps = {
  listBranchesQuery: BranchesQueryResponse;
  listReportsQuery: ReportsQueryResponse;
} & Props;

const ListContainer = (props: FinalProps) => {
  const { listReportsQuery, queryParams, currentUser } = props;
  const { branchId, deptId } = queryParams;

  if (listReportsQuery && listReportsQuery.loading) {
    return <Spinner />;
  }

  const exportReport = () => {
    const stringified = queryString.stringify({
      ...queryParams,
      currentUserId: currentUser._id
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
      options: ({ queryParams, reportType, isCurrentUserAdmin }) => ({
        variables: {
          ...generateParams(queryParams),
          reportType,
          isCurrentUserAdmin
        },
        fetchPolicy: 'network-only'
      })
    })
  )(ListContainer)
);
