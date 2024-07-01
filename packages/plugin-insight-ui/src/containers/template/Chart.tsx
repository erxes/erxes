import React from 'react';

import { gql, useQuery } from '@apollo/client';

import ChartTemplates from '../../components/template/Chart';
import { queries } from '../../graphql';
import {
  IReportTemplate,
  InsightChartTemplatesListQueryResponse,
} from '../../types';

type Props = {
  report?: any;
  template: IReportTemplate;
  chartsOfReportTemplate: string[];
  templateCharts: string[];
  setTemplateCharts(templateCharts: string[]): void;
};

const ChartTemplatesContainer = (props: Props) => {
  const { template } = props;
  const { serviceName, charts } = template;

  const reportChartTemplatesListQuery =
    useQuery<InsightChartTemplatesListQueryResponse>(
      gql(queries.insightChartTemplatesList),
      {
        variables: {
          serviceName,
          charts,
        },
        fetchPolicy: 'network-only',
      },
    );

  const chartTemplates =
    reportChartTemplatesListQuery?.data?.insightChartTemplatesList || [];
  const loading = reportChartTemplatesListQuery.loading;

  const updatedProps = {
    ...props,
    chartTemplates,
    loading,
  };

  return <ChartTemplates {...updatedProps} />;
};

export default ChartTemplatesContainer;
