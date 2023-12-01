import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';

import ChartForm from '../../components/chart/ChartForm';
import { mutations, queries } from '../../graphql';
import {
  IChart,
  ReportChartFormMutationResponse,
  ReportChartTemplatesListQueryResponse,
  reportServicesListQueryResponse
} from '../../types';
import { Alert, router } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
type Props = {
  history: any;
  queryParams: any;
  toggleForm: () => void;
  showChartForm: boolean;
  reportId: string;

  chart?: IChart;
};

type FinalProps = {
  reportChartTemplatesListQuery: ReportChartTemplatesListQueryResponse;
  reportServicesListQuery: reportServicesListQueryResponse;
} & Props &
  ReportChartFormMutationResponse;

const ChartFormList = (props: FinalProps) => {
  const {
    reportServicesListQuery,
    reportChartTemplatesListQuery,
    reportChartsAddMutation,
    reportChartsEditMutation,
    reportChartsRemoveMutation,
    toggleForm,
    history
  } = props;

  if (reportServicesListQuery.loading) {
    return <Spinner />;
  }

  const removeReportChartParams = () => {
    router.removeParams(history, 'serviceName', 'chartTemplateType');
  };

  const chartsEdit = (values, callback) => {
    reportChartsEditMutation({ variables: values });
    if (callback) {
      callback();
      removeReportChartParams();
    }
  };

  const chartsAdd = values => {
    reportChartsAddMutation({ variables: values })
      .then(() => {
        Alert.success('Successfully added chart');
        removeReportChartParams();
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
    serviceNames: reportServicesListQuery.reportServicesList || [],
    chartTemplates:
      reportChartTemplatesListQuery?.reportChartTemplatesList || []
  };

  return <ChartForm {...finalProps} />;
};

export default compose(
  graphql<Props, any, {}>(gql(queries.reportServicesList), {
    name: 'reportServicesListQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql<Props, any, {}>(gql(queries.reportChartTemplatesList), {
    name: 'reportChartTemplatesListQuery',
    options: ({ queryParams }) => ({
      variables: { serviceName: queryParams.serviceName },
      fetchPolicy: 'network-only'
    }),
    skip: ({ queryParams }) => !queryParams.serviceName
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
