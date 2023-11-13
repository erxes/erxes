import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';

import ChartForm from '../../components/chart/ChartForm';
import { mutations, queries } from '../../graphql';
import {
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
    reportChartsRemoveMutation
  } = props;

  const { reportTemplatesList = [] } = reportTemplatesListQuery;

  const chartsEdit = values => {
    reportChartsAddMutation({ variables: values })
      .then(() => {})
      .catch(err => Alert.error(err.message));
  };

  const chartsAdd = values => {
    reportChartsEditMutation({ variables: values })
      .then(() => {})
      .catch(err => Alert.error(err.message));
  };

  const chartsRemove = (_id: string) => {
    reportChartsRemoveMutation(_id)
      .then(() => {})
      .catch(err => Alert.error(err.message));
  };

  const finalProps = {
    ...props,
    chartsAdd,
    chartsEdit,
    reportTemplates: reportTemplatesList
  };

  return <ChartForm {...finalProps} />;
};

export default compose(
  graphql<Props, any, {}>(gql(queries.reportTemplatesList), {
    name: 'reportTemplatesListQuery',
    options: () => ({
      variables: {},
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
