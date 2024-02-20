import React, { useEffect } from 'react';
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../../graphql';
import { Alert, Spinner, router } from '@erxes/ui/src';
import ChartTemplates from '../../components/template/Chart';
import ChartLoader from '../../components/template/ChartLoader';
import {
  IReport,
  IReportTemplate,
  ReportChartTemplatesListQueryResponse,
} from '../../types';

type Props = {
  report: IReport;
  template: IReportTemplate;
  chartsOfReportTemplate: string[];
  templateCharts: string[];
  setTemplateCharts(templateCharts: string[]): void;
};

const ChartTemplatesContainer = (props: Props) => {
  const { template } = props;
  const { serviceName, charts } = template;

  const reportChartTemplatesListQuery =
    useQuery<ReportChartTemplatesListQueryResponse>(
      gql(queries.reportChartTemplatesList),
      {
        variables: {
          serviceName,
          charts,
        },
        fetchPolicy: 'network-only',
      },
    );

  const chartTemplates =
    reportChartTemplatesListQuery?.data?.reportChartTemplatesList || [];
  const loading = reportChartTemplatesListQuery.loading;

  const updatedProps = {
    ...props,
    chartTemplates,
    loading,
  };

  return <ChartTemplates {...updatedProps} />;
};

export default ChartTemplatesContainer;
