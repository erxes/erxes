import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';

import ChartForm from '../../components/chart/ChartForm';
import { mutations, queries } from '../../graphql';
import {
  IChart,
  ReportChartFormMutationResponse,
  ReportTemplatesListQueryResponse
} from '../../types';
import { Alert } from '@erxes/ui/src/utils';
type Props = {
  history: any;
  queryParams: any;
  toggleForm: () => void;
  showChatForm: boolean;
  reportId: string;

  chart?: IChart;
};

type FinalProps = {
  reportTemplatesListQuery: ReportTemplatesListQueryResponse;
} & Props &
  ReportChartFormMutationResponse;

const ChartFormList = (props: FinalProps) => {
  const {
    reportTemplatesListQuery,
    reportChartsAddMutation,
    reportChartsEditMutation,
    reportChartsRemoveMutation,
    toggleForm
  } = props;

  const { reportTemplatesList = [] } = reportTemplatesListQuery;

  const chartsEdit = values => {
    reportChartsEditMutation({ variables: values });
    // .then(() => {
    //   Alert.success('Successfully edited chart');
    // })
    // .catch(err => Alert.error(err.message));
  };

  const chartsAdd = values => {
    reportChartsAddMutation({ variables: values })
      .then(() => {
        Alert.success('Successfully added chart');
        toggleForm();
      })
      .catch(err => Alert.error(err.message));
  };

  const chartsRemove = (_id: string) => {
    reportChartsRemoveMutation(_id)
      .then(() => {
        Alert.success('Successfully removed chart');
      })
      .catch(err => Alert.error(err.message));
  };

  const finalProps = {
    ...props,
    chartsAdd,
    chartsEdit,
    chartsRemove,
    reportTemplates: reportTemplatesList
  };

  return <ChartForm {...finalProps} />;
};

export default compose(
  graphql<Props, any, {}>(gql(queries.reportTemplatesList), {
    name: 'reportTemplatesListQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql<Props, any, {}>(gql(mutations.reportChartsAdd), {
    name: 'reportChartsAddMutation',
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
  graphql<Props, any, {}>(gql(mutations.reportChartsEdit), {
    name: 'reportChartsEditMutation',
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
  })
)(ChartFormList);
