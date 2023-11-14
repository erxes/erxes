import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import { mutations, queries } from '../../graphql';
import {
  ReportDetailQueryResponse,
  ReportsMutationResponse
} from '../../types';
import Report from '../../components/report/Report';

type Props = {
  history: any;
  queryParams: any;
  reportId: string;
};

type FinalProps = {
  reportDetailQuery: ReportDetailQueryResponse;
} & Props &
  ReportsMutationResponse;
const ReportList = (props: FinalProps) => {
  const {
    reportDetailQuery,
    reportId,
    reportsEditMutation,
    reportChartsEditMutation,
    reportChartsRemoveMutation
  } = props;

  if (reportDetailQuery.loading) {
    return <Spinner />;
  }

  const reportsEdit = (_id: string, values: any, callback?: any) => {
    reportsEditMutation({ variables: { _id, ...values } })
      .then(() => {
        Alert.success('Successfully edited report');
        if (callback) {
          callback();
        }
      })
      .catch(err => Alert.error(err.message));
  };

  const reportChartsEdit = (_id: string, values: any, callback?: any) => {
    reportChartsEditMutation({ variables: { _id, ...values } }).then(() => {
      Alert.success('Successfully edited chart');
      if (callback) {
        callback();
      }
    });
  };

  const reportChartsRemove = (_id: string) => {
    reportChartsRemoveMutation({ variables: { _id } })
      .then(() => {
        Alert.success('Successfully removed chart');
      })
      .catch(err => Alert.error(err.message));
  };

  return (
    <Report
      report={reportDetailQuery?.reportDetail}
      reportsEdit={reportsEdit}
      reportChartsEdit={reportChartsEdit}
      reportChartsRemove={reportChartsRemove}
      {...props}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(mutations.reportsEdit), {
      name: 'reportsEditMutation',
      options: variables => ({
        variables,
        fetchPolicy: 'network-only',
        refetchQueries: ['reportsList']
      })
    }),
    graphql<Props, any>(gql(mutations.reportChartsEdit), {
      name: 'reportChartsEditMutation',
      options: ({ reportId, ...variables }) => ({
        variables,
        fetchPolicy: 'network-only',
        refetchQueries: [
          {
            query: gql(queries.reportDetail),
            variables: {
              reportId
            }
          }
        ]
      })
    }),
    graphql<Props, any>(gql(mutations.reportChartsRemove), {
      name: 'reportChartsRemoveMutation',
      options: ({ reportId }) => ({
        fetchPolicy: 'network-only',
        refetchQueries: [
          {
            query: gql(queries.reportDetail),
            variables: {
              reportId
            }
          }
        ]
      })
    }),
    graphql<Props, any, { reportId: string }>(gql(queries.reportDetail), {
      name: 'reportDetailQuery',
      options: ({ reportId }) => ({
        variables: { reportId },
        fetchPolicy: 'network-only'
      })
    })
  )(ReportList)
);
