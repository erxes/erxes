import * as compose from "lodash.flowright";

import {
  DEFAULT_BACKGROUND_COLORS,
  DEFAULT_BORDER_COLORS,
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

const getRandomNumbers = (num?: number) => {
  const getRandomNumber: number = Math.floor(Math.random() * (DEFAULT_BACKGROUND_COLORS.length - (num || 0) - 1));

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

  chartVariables: any;
  filter?: any;
  dimension?: any;
  chartHeight?: number;
  setFilter?: (fieldName: string, value: any) => void
};

type FinalProps = {
  chartGetResultQuery: any;
} & Props;
const ChartRendererList = (props: FinalProps) => {
  const { chartGetResultQuery, chartVariables, filter, chartType, setFilter } = props;

  if (chartGetResultQuery && chartGetResultQuery.loading) {
    return <Spinner />;
  }

  const getResult = chartGetResultQuery?.chartGetResult || {};

  let finalProps: any = {
    ...props,
    loading: chartGetResultQuery.loading,
  };

  if (getResult && Array.isArray(getResult)) {
    const randomNums = getRandomNumbers(getResult.length);

    const datasets = (getResult || []).map((d, index) => ({
      ...d,
      backgroundColor: DEFAULT_BACKGROUND_COLORS[randomNums[index]],
      borderColor: DEFAULT_BORDER_COLORS[randomNums[index]],
      borderWidth: 1,
    }));

    finalProps = { ...finalProps, datasets };

    return <ChartRenderer {...finalProps} />;
  }

  const { data, labels, datasets, title, options } =
    chartGetResultQuery?.chartGetResult || {};

  const dataset = { data, labels, title };

  if (chartType === "table") {
    return (
      <TableRenderer
        filters={filter}
        setFilter={setFilter}
        dataset={dataset}
      />
    );
  }

  if (chartType === "pivotTable") {
    return (
      <PivotTable
        dataset={chartGetResultQuery?.chartGetResult}
      />
    );
  }

  if (chartType === "number") {
    return (
      <NumberRenderer
        dataset={dataset}
        serviceName={chartVariables.serviceName}
      />
    );
  }

  const chartGetResult =
    !data && !labels && !title && chartGetResultQuery.chartGetResult;

  const randomNums = getRandomNumbers(datasets?.[0]?.data?.length);
  const extendedDatasets = (datasets || []).map((set, index) => {
    const newSet = { ...set };

    newSet.backgroundColor = DEFAULT_BACKGROUND_COLORS[randomNums[index]];
    newSet.borderColor = DEFAULT_BORDER_COLORS[randomNums[index]];

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
    loading: chartGetResultQuery.loading,
  };

  return <ChartRenderer {...finalProps} />;
};

export default withProps<Props>(
  compose(
    graphql<any>(gql(queries.chartGetResult), {
      name: "chartGetResultQuery",
      options: ({ chartVariables, filter, dimension, chartType }) => ({
        variables: {
          serviceName: chartVariables.serviceName,
          templateType: chartVariables.templateType,
          filter: { ...filter },
          dimension: { ...dimension },
          chartType,
        },
        fetchPolicy: "network-only",
      }),
    })
  )(ChartRendererList)
);
