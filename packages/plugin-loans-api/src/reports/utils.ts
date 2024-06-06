import * as __ from 'lodash';
import { IModels } from '../connectionResolver';

interface IOption {
  label: string;
  value: string;
  aggregate?:
    | {
        project?: {
          path: string;
          value: any;
        };
        lookup?: any[];
      }
    | any[];
  format?: (v: any) => any;
}

export function generateAggregateOption(
  aggregate: any[],
  project: any,
  filter: string[],
  options: IOption[]
) {
  for (let key of filter) {
    const option = options.find((row) => row.value == key);
    if (option && option.aggregate) {
      if (__.isArray(option.aggregate)) {
        aggregate = [...aggregate, ...option.aggregate];
      } else if (
        option.aggregate?.project &&
        __.isObject(option.aggregate.project)
      ) {
        __.set(
          project,
          option.aggregate.project.path,
          option.aggregate.project.value
        );
        if (option?.aggregate?.lookup && __.isArray(option.aggregate.lookup)) {
          aggregate = [...aggregate, ...option.aggregate.lookup];
        }
      }
    }
  }
  return { project, aggregate };
}

export async function generateData(
  models: IModels,
  modelName: keyof IModels,
  DIMENSION_OPTIONS: IOption[],
  MEASURE_OPTIONS: IOption[],
  filter: { dimension?: string[]; measure?: string[] },
  chartType: string
) {
  let aggregate: any = [];
  let project: any = { _id: 0 };

  let { dimension, measure, ...match } = filter;

  if (dimension) {
    const dimensionAggregate = generateAggregateOption(
      aggregate,
      project,
      dimension,
      DIMENSION_OPTIONS
    );
    aggregate = dimensionAggregate.aggregate;
    project = dimensionAggregate.project;
  }

  if (measure) {
    const measureAggregate = generateAggregateOption(
      aggregate,
      project,
      measure,
      MEASURE_OPTIONS
    );
    aggregate = measureAggregate.aggregate;
    project = measureAggregate.project;
  }

  const resultData = await models[modelName].aggregate([
    ...aggregate,
    { $project: project },
    { $match: match }
  ]);

  resultData.forEach((row) => {
    DIMENSION_OPTIONS.forEach((field) => {
      if (field.format && row[field.value]) {
        row[field.value] = field.format(row[field.value]);
      }
    });
    if (chartType === 'table') {
      MEASURE_OPTIONS.forEach((field) => {
        if (field.format && row[field.value]) {
          row[field.value] = field.format(row[field.value]);
        }
      });
    }
  });

  return resultData;
}

export function generateChartData(
  resultData: any[],
  dimension: string,
  measure: string
) {
  let labels: any[] = [];
  let data: any[] = [];
  if (resultData.length > 0) {
    resultData.forEach((row) => {
      labels.push(row[dimension]);
      data.push(row[measure]);
    });
  }
  return { labels, data };
}
