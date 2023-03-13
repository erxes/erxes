import { getEnv, withProps } from '@erxes/ui/src/utils/core';
import queryString from 'query-string';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import React from 'react';
import ReportList from '../../components/report/ReportList';
import { queries } from '../../graphql';
import { ReportsQueryResponse } from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generateParams } from '../../utils';

type Props = {
  history: any;
  queryParams: any;
  searchValue?: string;

  reportType: string;
};

type FinalProps = {
  bichilTimeclockReportQuery: ReportsQueryResponse;
} & Props;

const ListContainer = (props: FinalProps) => {
  const { bichilTimeclockReportQuery, queryParams } = props;
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
    totalCount = 0
  } = bichilTimeclockReportQuery.bichilTimeclockReport;

  const updatedProps = {
    ...props,
    exportReport,
    bichilReports: list,
    totalCount,
    branchId,
    deptId
  };

  return <ReportList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ReportsQueryResponse>(gql(queries.bichilTimeclockReport), {
      name: 'bichilTimeclockReportQuery',
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
