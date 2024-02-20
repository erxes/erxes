import React from 'react';
import Form from '../../components/report/Form';
import { gql, useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../../graphql';
import { Alert, Spinner } from '@erxes/ui/src';
import {
  ReportDetailQueryResponse,
  ReportEditMutationResponse,
  ReportFormMutationVariables,
  ReportTemplatesListQueryResponse,
} from '../../types';

type Props = {
  queryParams: any;
  history: any;

  reportId?: string;

  closeDrawer: () => void;
};

const FormContainer = (props: Props) => {
  const { queryParams, reportId, history, closeDrawer } = props;

  const reportDetailQuery = useQuery<ReportDetailQueryResponse>(
    gql(queries.reportDetail),
    {
      skip: !reportId,
      variables: { reportId },
    },
  );

  const reportTemplatesListQuery = useQuery<ReportTemplatesListQueryResponse>(
    gql(queries.reportTemplatesList),
  );

  const [reportAddMutation] = useMutation(gql(mutations.reportAdd), {
    refetchQueries: [
      {
        query: gql(queries.sectionList),
        variables: { type: 'report' },
      },
      {
        query: gql(queries.reportList),
      },
    ],
  });

  const [reportEditMutation] = useMutation(
    gql(mutations.reportChartsEditMany),
    {
      refetchQueries: [
        {
          query: gql(queries.sectionList),
          variables: { type: 'report' },
        },
        {
          query: gql(queries.reportList),
        },
        {
          query: gql(queries.reportDetail),
          variables: {
            reportId,
          },
        },
      ],
    },
  );

  const handleMutation = (values: ReportFormMutationVariables) => {
    if (reportId) {
      return reportEditMutation({ variables: { reportId, ...values } })
        .then(() => {
          closeDrawer();

          Alert.success('Successfully edited report');
          history.push(`/insight?reportId=${reportId}`);
        })
        .catch((err) => Alert.error(err.message));
    }

    reportAddMutation({ variables: { ...values } })
      .then((res) => {
        closeDrawer();

        Alert.success('Successfully created report');
        const { _id } = res.data.reportsAdd;
        if (_id) {
          history.push(`/insight?reportId=${_id}`);
        }
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  if (reportDetailQuery.loading) {
    return <Spinner />;
  }

  const report = reportDetailQuery?.data?.reportDetail;
  const loading = reportDetailQuery.loading;
  const reportTemplates =
    reportTemplatesListQuery?.data?.reportTemplatesList || [];

  const updatedProps = {
    ...props,
    report,
    loading,
    reportTemplates,
    handleMutation,
  };

  return <Form {...updatedProps} />;
};

export default FormContainer;
