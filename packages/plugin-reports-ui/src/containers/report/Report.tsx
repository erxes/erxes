import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import { queries } from '../../graphql';
import { ReportDetailQueryResponse } from '../../types';
import Report from '../../components/report/Report';

type Props = {
  history: any;
  queryParams: any;
  reportId: string;
};

type FinalProps = {
  reportDetailQuery: ReportDetailQueryResponse;
} & Props;
const ReportList = (props: FinalProps) => {
  const { reportDetailQuery, reportId } = props;

  console.log('reportId ', reportId);
  if (reportDetailQuery.loading) {
    return <Spinner />;
  }

  return <Report report={reportDetailQuery?.reportDetail} {...props} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, any, { reportId: string }>(gql(queries.reportDetail), {
      name: 'reportDetailQuery',
      options: ({ reportId }) => ({
        variables: { reportId },
        fetchPolicy: 'network-only'
      })
    })
  )(ReportList)
);
