import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import { queries, mutations } from '../../graphql';
import {
  ReportChartTemplatesListQueryResponse,
  ReportFormMutationResponse,
  ReportFormMutationVariables
} from '../../types';
import ReportFormModalComponent from '../../components/report/ReportFormModal';
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

type FinalProps = {
  reportChartTemplatesListQuery: ReportChartTemplatesListQueryResponse;
} & Props &
  ReportFormMutationResponse;

const ReportFormModal = (props: FinalProps) => {
  const {
    reportChartTemplatesListQuery,
    reportsAddMutation,
    setShowModal,
    serviceName,
    history,
    charts,
    reportTemplateType
  } = props;

  if (reportChartTemplatesListQuery?.loading) {
    return <Spinner />;
  }

  const createReport = async (values: ReportFormMutationVariables) => {
    reportsAddMutation({ variables: { ...values, serviceName } })
      .then(res => {
        Alert.success('Successfully created report');
        setShowModal(false);
        const { _id } = res.data.reportsAdd;
        if (_id) {
          history.push('/reports/details/' + _id);
        }
      })
      .catch(err => {
        Alert.error(err.message);
      });
  };

  return (
    <ReportFormModalComponent
      {...props}
      chartsOfReportTemplate={charts || []}
      chartTemplates={
        reportChartTemplatesListQuery?.reportChartTemplatesList || []
      }
      createReport={createReport}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, any, { serviceName?: string; charts?: string[] }>(
      gql(queries.reportChartTemplatesList),
      {
        name: 'reportChartTemplatesListQuery',
        skip: ({ emptyReport }) => emptyReport || false,
        options: ({ serviceName, charts }) => ({
          variables: { serviceName, charts },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<any>(gql(mutations.reportsAdd), {
      name: 'reportsAddMutation',
      options: ({
        name,
        visibility,
        selectedMemberIds,
        departmentIds,
        tagIds
      }) => ({
        variables: {
          name,
          visibility,
          selectedMemberIds,
          departmentIds,
          tagIds
        },
        fetchPolicy: 'network-only'
      })
    })
  )(ReportFormModal)
);
