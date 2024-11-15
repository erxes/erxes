import * as compose from "lodash.flowright";

import {
  DEFAULT_CHART_COLORS
} from "../../components/chart/utils";

import ChartRenderer from "../../components/chart/ChartRenderer";
import NumberRenderer from "../../components/chart/NumberRenderer";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import TableRenderer from "../../components/chart/TableRenderer";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "../../graphql";
import { withProps } from "@erxes/ui/src/utils/core";
import PivotTable from "../../components/chart/PivotTable";

type Props = {
  queryParams: any;
  chartType: string;

  chartVariables: any;
  filter?: any;
  dimension?: any;
  chartHeight?: number;
  setFilter?: (fieldName: string, value: any) => void;
};

type FinalProps = {
  chartGetResultQuery: any;
} & Props;
const ChartRendererList = (props: FinalProps) => {
  const { chartGetResultQuery, chartVariables, filter, chartType, setFilter } =
    props;

  if (!chartVariables.serviceName || !chartVariables.templateType) {
    return null
  }

  if (chartGetResultQuery && chartGetResultQuery.loading) {
    return <Spinner />;
  }

  const getResult = chartGetResultQuery?.chartGetResult || {};

  let finalProps: any = {
    ...props,
    loading: chartGetResultQuery.loading
  };

  if (getResult && Array.isArray(getResult)) {
    const availableColors = [...DEFAULT_CHART_COLORS];

    const datasets = (getResult || []).map((d, index) => {

      const randomIndex = Math.floor(Math.random() * availableColors.length);
      const randomColor = availableColors[randomIndex];

      availableColors.splice(randomIndex, 1);

      return {
        ...d,
        backgroundColor: randomColor,
        borderColor: randomColor.replace('0.6', '1'),
        borderWidth: 1,
      }
    });

    finalProps = { ...finalProps, datasets };

    return <ChartRenderer {...finalProps} />;
  }

  const { data, labels, headers, datasets, title, options } =
    chartGetResultQuery?.chartGetResult || {};

  const dataset = { data, labels, title, headers };

  if (chartType === "table") {
    return (
      <TableRenderer filters={filter} setFilter={setFilter} dataset={dataset} />
    );
  }

  if (chartType === "pivotTable") {
    return <PivotTable dataset={chartGetResultQuery?.chartGetResult} />;
  }

  if (chartType === "number") {
    return (
      <NumberRenderer
        dataset={dataset}
        serviceName={chartVariables.serviceName}
      />
    );
  }

  const chartGetResult = !data && !labels && !title && chartGetResultQuery.chartGetResult;

  const availableColors = [...DEFAULT_CHART_COLORS];

  const extendedDatasets = (datasets || []).map((set, index) => {
    const newSet = { ...set };

    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const randomColor = availableColors[randomIndex];

    availableColors.splice(randomIndex, 1);

    newSet.backgroundColor = randomColor
    newSet.borderColor = randomColor.replace('0.6', '1')

    return newSet;
  });

  finalProps = {
    ...props,
    options,
    datasets: extendedDatasets,
    dataset: chartGetResult,
    data,
    labels,
    title,
    loading: chartGetResultQuery.loading
  };

  return <ChartRenderer {...finalProps} />;
};

export default withProps<Props>(
  compose(
    graphql<any>(gql(queries.chartGetResult), {
      name: "chartGetResultQuery",
      skip: ({ chartVariables }) =>
        !chartVariables.serviceName || !chartVariables.templateType,
      options: ({ chartVariables, filter, dimension, chartType }) => ({
        variables: {
          serviceName: chartVariables.serviceName,
          templateType: chartVariables.templateType,
          filter: { ...filter },
          dimension: { ...dimension },
          chartType
        },
        fetchPolicy: "network-only"
      })
    })
  )(ChartRendererList)
);
