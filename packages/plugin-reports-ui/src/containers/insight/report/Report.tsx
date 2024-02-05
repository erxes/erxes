import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../../../graphql';
import { Alert } from '@erxes/ui/src';
import Report from '../../../components/insight/report/Report';

type Props = {
  queryParams: any;
  history: any;
};

const ReportContainer = (props: Props) => {
  const { queryParams } = props;

  const reportQuery = useQuery(gql(queries.reportDetail), {
    skip: !queryParams.reportId,
    variables: {
      reportId: queryParams.reportId,
    },
  });

  const [reportChartsEditMutation] = useMutation(
    gql(mutations.reportChartsEdit),
  );

  const [reportChartsRemoveMutation] = useMutation(
    gql(mutations.reportChartsRemove),
    {
      refetchQueries: ['reportsList', 'reportDetail'],
    },
  );

  const reportChartsEdit = (_id: string, values: any) => {
    reportChartsEditMutation({ variables: { _id, ...values } });
  };

  const reportChartsRemove = (_id: string) => {
    reportChartsRemoveMutation({ variables: { _id } })
      .then(() => {
        Alert.success('Successfully removed chart');
      })
      .catch((err) => Alert.error(err.message));
  };

  const report = reportQuery?.data?.reportDetail || {};
  const loading = reportQuery.loading;

  const updatedProps = {
    ...props,
    report,
    loading,
    reportChartsRemove,
    reportChartsEdit,
  };

  return <Report {...updatedProps} />;
};

export default ReportContainer;
