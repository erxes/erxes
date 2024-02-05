import React from 'react';
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../../../graphql';
import { Alert, Spinner, router } from '@erxes/ui/src';
import {
  IReport,
  ReportChartTemplatesListQueryResponse,
  ReportFormMutationResponse,
  ReportFormMutationVariables,
} from '../../../types';
import Form from '../../../components/insight/report/Form';

type Props = {
  history: any;
  queryParams: any;

  reportId?: string;
  emptyReport?: boolean;

  searchValue?: string;

  setShowDrawer(value: boolean): void;
};

const FormContainer = (props: Props) => {
  const { reportId, history, searchValue, setShowDrawer } = props;

  console.log('reportId', reportId);

  const reportDetailQuery = useQuery(gql(queries.reportDetail), {
    skip: !reportId,
    variables: { reportId },
  });

  const reportTemplatesListQuery = useQuery(gql(queries.reportTemplatesList), {
    variables: { searchValue: searchValue || '' },
  });

  const [reportChartTemplatesMutation, reportChartTemplatesListQuery] =
    useLazyQuery(gql(queries.reportChartTemplatesList), {
      fetchPolicy: 'network-only',
    });

  const [reportsAddMutation] = useMutation(gql(mutations.reportsAdd), {
    refetchQueries: ['reportsList'],
  });

  const [reportsEditMutation] = useMutation(gql(mutations.reportsEdit), {
    refetchQueries: ['reportsList', 'reportDetail'],
  });

  const loadReportChartTemplates = (serviceName, charts) => {
    reportChartTemplatesMutation({ variables: { serviceName, charts } }).catch(
      (err) => {
        Alert.error(err.message);
      },
    );
  };

  const handleMutation = (values: ReportFormMutationVariables) => {
    if (reportId) {
      return reportsEditMutation({ variables: { _id: reportId, ...values } })
        .then(() => {
          Alert.success('Successfully edited report');
          router.setParams(history, { reportId: reportId });
        })
        .catch((err) => Alert.error(err.message));
    }

    reportsAddMutation({ variables: { ...values } })
      .then((res) => {
        setShowDrawer(false);

        Alert.success('Successfully created report');
        const { _id } = res.data.reportsAdd;
        if (_id) {
          router.setParams(history, { reportId: _id });
        }
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  if (reportDetailQuery.loading) {
    return <Spinner />;
  }

  const report = reportDetailQuery?.data?.reportDetail || {};
  const reportTemplates =
    reportTemplatesListQuery?.data?.reportTemplatesList || [];
  const chartTemplates =
    reportChartTemplatesListQuery?.data?.reportChartTemplatesList || [];

  const updatedProps = {
    ...props,
    report,
    reportTemplates,
    chartTemplates,
    setShowDrawer,
    handleMutation,
    loadReportChartTemplates,
  };

  return <Form {...updatedProps} />;
};

export default FormContainer;
