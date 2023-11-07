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
  serviceName?: string;
  emptyReport?: boolean;
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
    setShowModal
  } = props;

  if (reportChartTemplatesListQuery?.loading) {
    return <Spinner />;
  }

  const createReport = async (values: ReportFormMutationVariables) => {
    reportsAddMutation({ variables: values })
      .then(() => {
        Alert.success('Successfully created report');
        setShowModal(false);
      })
      .catch(err => {
        Alert.error(err.message);
      });
  };

  return (
    <ReportFormModalComponent
      {...props}
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
