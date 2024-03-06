import React from 'react';

import { gql, useQuery, useMutation } from '@apollo/client';

import Alert from '@erxes/ui/src/utils/Alert/index';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import { __ } from '@erxes/ui/src/utils/index';
import { router } from '@erxes/ui/src/utils';

import Report from '../../components/report/Report';
import { queries, mutations } from '../../graphql';
import {
  IReport,
  ReportChartFormMutationVariables,
  ReportDetailQueryResponse,
} from '../../types';

type Props = {
  history: any;
  queryParams: any;
};

const ReportContainer = (props: Props) => {
  const { queryParams, history } = props;

  const reportQuery = useQuery<ReportDetailQueryResponse>(
    gql(queries.reportDetail),
    {
      skip: !queryParams.reportId,
      variables: {
        reportId: queryParams.reportId,
      },
      fetchPolicy: 'network-only',
    },
  );

  const [reportDuplicateMutation] = useMutation(
    gql(mutations.reportsDuplicate),
    {
      refetchQueries: [
        {
          query: gql(queries.sectionList),
          variables: { type: 'report' },
        },
        {
          query: gql(queries.reportList),
        },
      ],
    },
  );

  const [reportRemoveMutation] = useMutation(gql(mutations.reportsRemove), {
    refetchQueries: [
      {
        query: gql(queries.reportList),
      },
    ],
  });

  const reportDuplicate = (_id: string) => {
    reportDuplicateMutation({ variables: { _id } })
      .then((res) => {
        Alert.success('Successfully duplicated report');
        const { _id } = res.data.reportsDuplicate;
        if (_id) {
          history.push(`/insight?reportId=${_id}`);
        }
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  const reportRemove = (ids: string[]) => {
    confirm(__('Are you sure to delete selected reports?')).then(() => {
      reportRemoveMutation({ variables: { ids } })
        .then(() => {
          if (ids.includes(queryParams.reportId)) {
            router.removeParams(history, ...Object.keys(queryParams));
          }
          Alert.success(__('Successfully deleted'));
        })
        .catch((e: Error) => Alert.error(e.message));
    });
  };

  const [reportChartsEditMutation] = useMutation(
    gql(mutations.reportChartsEdit),
  );

  const [reportChartsRemoveMutation] = useMutation(
    gql(mutations.reportChartsRemove),
    {
      refetchQueries: ['reportsList', 'reportDetail'],
    },
  );

  const reportChartsEdit = (
    _id: string,
    values: ReportChartFormMutationVariables,
  ) => {
    reportChartsEditMutation({ variables: { _id, ...values } });
  };

  const reportChartsRemove = (_id: string) => {
    reportChartsRemoveMutation({ variables: { _id } })
      .then(() => {
        Alert.success('Successfully removed chart');
      })
      .catch((err) => Alert.error(err.message));
  };

  const report = reportQuery?.data?.reportDetail || ({} as IReport);
  const loading = reportQuery.loading;

  const updatedProps = {
    ...props,
    report,
    loading,
    reportChartsRemove,
    reportChartsEdit,
    reportDuplicate,
    reportRemove,
  };

  return <Report {...updatedProps} />;
};

export default ReportContainer;
