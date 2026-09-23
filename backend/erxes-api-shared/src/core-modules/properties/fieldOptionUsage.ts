import { PipelineStage } from 'mongoose';

export interface IFieldOptionUsageCount {
  value: string;
  count: number;
}

export interface IFieldOptionUsageModel {
  aggregate: (
    pipeline: PipelineStage[],
  ) => Promise<Array<{ _id: string; count: number }>>;
}

export const getFieldOptionUsedValuesFromModel = async (
  model: IFieldOptionUsageModel,
  fieldId: string,
  values: string[],
): Promise<IFieldOptionUsageCount[]> => {
  if (!values.length) {
    return [];
  }

  const propertiesDataPath = `propertiesData.${fieldId}`;

  const [fromCustomFieldsData, fromPropertiesData] = await Promise.all([
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
  ]);

  const counts = new Map<string, number>();

  for (const row of [...fromCustomFieldsData, ...fromPropertiesData]) {
    counts.set(row._id, (counts.get(row._id) || 0) + row.count);
  }

  return Array.from(counts, ([value, count]) => ({ value, count }));
};
