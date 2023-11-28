import { getEnv, withProps } from '@erxes/ui/src/utils/core';
import queryString from 'query-string';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import React from 'react';
import ReportList from '../../components/report/ReportList';
import { queries } from '../../graphql';
import { ReportsQueryResponse } from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generateParams } from '../../utils';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';

type Props = {
  history: any;
  queryParams: any;
  searchValue?: string;

  reportType: string;
  isCurrentUserAdmin: boolean;
  getPagination: (pagination: any) => void;
};

type FinalProps = {
  bichilTimeclockReportQuery: ReportsQueryResponse;
} & Props;

const ListContainer = (props: FinalProps) => {
  const { bichilTimeclockReportQuery, queryParams, getPagination } = props;
  const { deptId, branchId } = queryParams;

  if (bichilTimeclockReportQuery.loading) {
    return <Spinner />;
  }

  const exportReport = () => {
    const stringified = queryString.stringify({
      ...queryParams
    });

    const { REACT_APP_API_URL } = getEnv();
    window.open(
      `${REACT_APP_API_URL}/pl:timeclock/bichil-report-export?${stringified}`
    );
  };

  const {
    list = [],
    totalCount = 0,
    totalHoursScheduled = 0,
    totalHoursWorked = 0,
    totalShiftNotClosedDeduction = 0,
    totalLateMinsDeduction = 0,
    totalDeductionPerGroup = 0
  } = bichilTimeclockReportQuery.bichilTimeclockReport;

  const deductionInfo = {
    totalHoursScheduled,
    totalHoursWorked,
    totalShiftNotClosedDeduction,
    totalLateMinsDeduction,
    totalDeductionPerGroup
  };

  const updatedProps = {
    ...props,
    exportReport,
    bichilReports: list,
    totalCount,
    branchId,
    deptId,
    deductionInfo
  };

  if (getPagination) {
    getPagination(<Pagination count={totalCount} />);
  }

  return <ReportList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ReportsQueryResponse>(gql(queries.bichilTimeclockReport), {
      name: 'bichilTimeclockReportQuery',
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
