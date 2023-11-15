import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import {
  IChartGetResultVariables,
  ReportChartGetResultQueryResponse
} from '../../types';
import { Spinner } from '@erxes/ui/src/components';
import ChartRenderer from '../../components/chart/ChartRenderer';
import { withProps } from '@erxes/ui/src/utils/core';
import { queries } from '../../graphql';
type Props = {
  history: any;
  queryParams: any;
  chartType: string;

  chartVariables: IChartGetResultVariables;
};

type FinalProps = {
  reportChartGetResultQuery: ReportChartGetResultQueryResponse;
} & Props;
const ChartRendererList = (props: FinalProps) => {
  const { reportChartGetResultQuery, chartVariables } = props;

  if (reportChartGetResultQuery && reportChartGetResultQuery.loading) {
    return <Spinner />;
  }

  const { data, labels, title } =
    reportChartGetResultQuery?.reportChartGetResult || {};

  const finalProps = {
    ...props,
    data,
    labels,
    title
  };

  return <ChartRenderer {...finalProps} />;
};

export default withProps<Props>(
  compose(
    graphql<any>(gql(queries.reportChartGetResult), {
      skip: ({ chartVariables }) => !Object.keys(chartVariables).length,
      name: 'reportChartGetResultQuery',
      options: ({ chartVariables }) => ({
        variables: chartVariables,
        fetchPolicy: 'network-only'
      })
    })
  )(ChartRendererList)
);
