import React, { useState } from 'react';
import Form from '../../../../components/insight/report/chart/Form';

import { gql, useQuery, useMutation } from '@apollo/client';
import { mutations, queries } from '../../../../graphql';
import {
  IChart,
  ReportChartFormMutationResponse,
  ReportChartTemplatesListQueryResponse,
  reportServicesListQueryResponse,
} from '../../../../types';
import { Alert } from '@erxes/ui/src';

type Props = {
  history: any;
  queryParams: any;
  chart?: IChart;
  reportId: string;
  setShowDrawer(showDrawer: boolean): void;
};

const FormContainer = (props: Props) => {
  const { queryParams, chart, reportId, setShowDrawer } = props;

  const [serviceName, setServiceName] = useState(
    chart?.serviceName || undefined,
  );

  const reportServicesListQuery = useQuery(gql(queries.reportServicesList), {
    fetchPolicy: 'network-only',
  });

  const reportChartTemplatesListQuery = useQuery(
    gql(queries.reportChartTemplatesList),
    {
      skip: !serviceName,
      variables: { serviceName },
      fetchPolicy: 'network-only',
    },
  );

  const [reportChartsAddMutation] = useMutation(
    gql(mutations.reportChartsAdd),
    {
      fetchPolicy: 'network-only',
      refetchQueries: ['reportsList', 'reportDetail'],
    },
  );

  const [reportChartsEditMutation] = useMutation(
    gql(mutations.reportChartsEdit),
    {
      fetchPolicy: 'network-only',
      refetchQueries: ['reportDetail'],
    },
  );

  const chartsAdd = (values) => {
    reportChartsAddMutation({ variables: { reportId, ...values } })
      .then(() => {
        Alert.success('Successfully added chart');
        setShowDrawer(false);
      })
      .catch((err) => Alert.error(err.message));
  };

  const chartsEdit = (values) => {
    reportChartsEditMutation({ variables: values })
      .then(() => {
        Alert.success('Successfully edited chart');
        setShowDrawer(false);
      })
      .catch((err) => Alert.error(err.message));
  };

  const serviceNames = reportServicesListQuery?.data?.reportServicesList || [];

  const chartTemplates =
    reportChartTemplatesListQuery?.data?.reportChartTemplatesList || [];

  const finalProps = {
    ...props,
    serviceNames,
    chartTemplates,
    chartsAdd,
    chartsEdit,
    updateServiceName: setServiceName,
  };

  return <Form {...finalProps} />;
};

export default FormContainer;
