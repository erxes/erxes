import React from 'react';
import { gql } from '@apollo/client';
import {
  IChartGetResultVariables,
  ReportChartGetResultQueryResponse,
} from '../../types';
import { Spinner } from '@erxes/ui/src/components';
import ChartRenderer from '../../components/chart/ChartRenderer';
import { queries } from '../../graphql';
import {
  DEFAULT_BACKGROUND_COLORS,
  DEFAULT_BORDER_COLORS,
} from '../../components/chart/utils';
import TableRenderer from '../../components/chart/TableRenderer';
import { useQuery } from '@apollo/client';

const getRandomNumbers = (num?: number) => {
  const getRandomNumber: number = Math.floor(
    Math.random() * (DEFAULT_BACKGROUND_COLORS.length - (num || 0) - 1),
  );

  if (!num) {
    return getRandomNumber;
  }

  const numbers: number[] = [];

  for (let i = 0; i < num; i++) {
    numbers.push(getRandomNumber + i);
  }

  return numbers;
};

type Props = {
  queryParams: any;
  chartType: string;

  chartVariables: IChartGetResultVariables;
  filter?: any;
  dimension?: any;
  chartHeight?: number;
};

const ChartRendererList = (props: Props) => {
  const { chartVariables, filter, chartType } = props;

  const reportChartGetResultQuery = useQuery<ReportChartGetResultQueryResponse>(
    gql(queries.reportChartGetResult),
    {
      variables: {
        serviceName: chartVariables.serviceName,
        templateType: chartVariables.templateType,
        filter: { ...filter },
      },
      fetchPolicy: 'network-only',
    },
  );

  if (reportChartGetResultQuery && reportChartGetResultQuery.loading) {
    return <Spinner />;
  }

  const getResult = reportChartGetResultQuery?.data?.reportChartGetResult || {};

  let finalProps: any = {
    ...props,
    loading: reportChartGetResultQuery.loading,
  };

  if (getResult && Array.isArray(getResult)) {
    const randomNums = getRandomNumbers(getResult.length);

    const datasets = getResult.map((d, index) => ({
      ...d,
      backgroundColor: DEFAULT_BACKGROUND_COLORS[randomNums[index]],
      borderColor: DEFAULT_BORDER_COLORS[randomNums[index]],
      borderWidth: 1,
    }));

    finalProps = { ...finalProps, datasets };

    return <ChartRenderer {...finalProps} />;
  }

  const { data, labels, title, options } =
    reportChartGetResultQuery?.data?.reportChartGetResult || {};

  const dataset = { data, labels, title };
  if (chartType === 'table') {
    return <TableRenderer dataset={dataset} />;
  }
  const datasets =
    !data &&
    !labels &&
    !title &&
    reportChartGetResultQuery?.data?.reportChartGetResult;

  finalProps = {
    ...props,
    options,
    datasets,
    data,
    labels,
    title,
    loading: reportChartGetResultQuery.loading,
  };

  return <ChartRenderer {...finalProps} />;
};

export default ChartRendererList;
