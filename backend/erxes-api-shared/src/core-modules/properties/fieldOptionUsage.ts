import { PipelineStage } from 'mongoose';

export interface IFieldOptionUsageModel {
  aggregate: (pipeline: PipelineStage[]) => Promise<Array<{ _id: string }>>;
}

export const getFieldOptionUsedValuesFromModel = async (
  model: IFieldOptionUsageModel,
  fieldId: string,
  values: string[],
): Promise<string[]> => {
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
      { $group: { _id: '$value' } },
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
      { $group: { _id: '$value' } },
    ]),
  ]);

  const used = new Set([
    ...fromCustomFieldsData.map((row) => row._id),
    ...fromPropertiesData.map((row) => row._id),
  ]);

  return Array.from(used);
};
