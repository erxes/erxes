import { gql } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import { queries, mutations } from '../../graphql';
import {
  ReportChartTemplatesListQueryResponse,
  ReportFormMutationResponse,
  ReportFormMutationVariables,
} from '../../types';
import ReportFormModalComponent from '../../components/report/ReportFormModal';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  history: any;
  queryParams: any;

  charts?: string[];
  emptyReport?: boolean;

  reportName?: string;
  serviceName?: string;
  reportTemplateType?: string | null;
  setShowModal(showModal: boolean): void;
};

const ReportFormModal = (props: Props) => {
  const { setShowModal, serviceName, history, charts, emptyReport } = props;

  const reportChartTemplatesListQuery =
    useQuery<ReportChartTemplatesListQueryResponse>(
      gql(queries.reportChartTemplatesList),
      {
        skip: emptyReport || false,
        variables: { serviceName, charts },
        fetchPolicy: 'network-only',
      },
    );

  const [reportsAddMutation] = useMutation<ReportFormMutationResponse>(
    gql(mutations.reportsAdd),
    {
      fetchPolicy: 'network-only',
    },
  );

  if (reportChartTemplatesListQuery?.loading) {
    return <Spinner />;
  }

  const createReport = async (values: ReportFormMutationVariables) => {
    reportsAddMutation({ variables: { ...values, serviceName } })
      .then((res) => {
        Alert.success('Successfully created report');
        setShowModal(false);
        const { _id } = res?.data?.reportsAdd || '';
        if (_id) {
          history.push('/reports/details/' + _id);
        }
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  return (
    <ReportFormModalComponent
      {...props}
      chartsOfReportTemplate={charts || []}
      chartTemplates={
        reportChartTemplatesListQuery?.data?.reportChartTemplatesList || []
      }
      createReport={createReport}
    />
  );
};

export default ReportFormModal;
