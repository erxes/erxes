import { PipelineStage } from 'mongoose';
import { propertyDataPath } from './keys';

export interface IFieldOptionUsageCount {
  value: string;
  count: number;
}

export interface IFieldOptionUsageModel {
  aggregate: (
    pipeline: PipelineStage[],
  ) => Promise<Array<{ _id: string; count: number }>>;
}

// A field inside a repeating group is never stored under `propertiesData.<fieldId>`
// directly — its rows live under `propertiesData.<groupKey>[]`, one row per entry.
const buildGroupRowPipeline = (
  groupKey: string,
  fieldId: string,
  values: string[],
): PipelineStage[] => {
  const rowsPath = propertyDataPath(groupKey);
  const rowValuePath = `${rowsPath}.${fieldId}`;

  return [
    { $match: { [rowValuePath]: { $in: values } } },
    { $unwind: `$${rowsPath}` },
    { $match: { [rowValuePath]: { $in: values } } },
    {
      $project: {
        value: {
          $cond: [
            { $isArray: `$${rowValuePath}` },
            `$${rowValuePath}`,
            [`$${rowValuePath}`],
          ],
        },
      },
    },
    { $unwind: '$value' },
    { $match: { value: { $in: values } } },
    { $group: { _id: '$value', count: { $sum: 1 } } },
  ];
};

export const getFieldOptionUsedValuesFromModel = async (
  model: IFieldOptionUsageModel,
  fieldId: string,
  values: string[],
  // Set when the field belongs to an `isMultiple` (repeating) group, so its
  // values must also be searched inside that group's rows.
  groupKey?: string | null,
): Promise<IFieldOptionUsageCount[]> => {
  if (!values.length) {
    return [];
  }

  const propertiesDataPath = `propertiesData.${fieldId}`;

  const pipelines = [
    model.aggregate([
      { $match: { 'customFieldsData.field': fieldId } },
      { $unwind: '$customFieldsData' },
      { $match: { 'customFieldsData.field': fieldId } },
      {
        $project: {
          value: {
            $cond: [
              { $isArray: '$customFieldsData.value' },
              '$customFieldsData.value',
              ['$customFieldsData.value'],
            ],
          },
        },
      },
      { $unwind: '$value' },
      { $match: { value: { $in: values } } },
      { $group: { _id: '$value', count: { $sum: 1 } } },
    ]),
    model.aggregate([
      { $match: { [propertiesDataPath]: { $in: values } } },
      {
        $project: {
          value: {
            $cond: [
              { $isArray: `$${propertiesDataPath}` },
              `$${propertiesDataPath}`,
              [`$${propertiesDataPath}`],
            ],
          },
        },
      },
      { $unwind: '$value' },
      { $match: { value: { $in: values } } },
      { $group: { _id: '$value', count: { $sum: 1 } } },
    ]),
  ];

  if (groupKey) {
    pipelines.push(
      model.aggregate(buildGroupRowPipeline(groupKey, fieldId, values)),
    );
  }

  const results = await Promise.all(pipelines);

  const counts = new Map<string, number>();

  for (const row of results.flat()) {
    counts.set(row._id, (counts.get(row._id) || 0) + row.count);
  }

  return Array.from(counts, ([value, count]) => ({ value, count }));
};
