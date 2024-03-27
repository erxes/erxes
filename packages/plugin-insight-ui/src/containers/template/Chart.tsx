import React, { useEffect } from 'react';

import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client';

import Alert from '@erxes/ui/src/utils/Alert/index';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import { router } from '@erxes/ui/src/utils';

import ChartTemplates from '../../components/template/Chart';
import ChartLoader from '../../components/template/ChartLoader';
import { queries, mutations } from '../../graphql';
import {
  IDashboard,
  IReport,
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
