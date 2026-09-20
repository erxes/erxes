import { IModels } from '~/connectionResolvers';

// Mirrors core-api's fieldOptionUsedValues aggregation: a deal's field value
// can live in either the legacy `customFieldsData` array (still written by
// imports and widget-submitted forms) or the newer `propertiesData` map
// (written by the card detail page's Properties panel), and in each shape
// the stored value is a scalar for select/radio but an array for
// multiSelect/check, so it is normalized to an array before unwinding rather
// than matched directly.
export const getDealFieldOptionUsedValues = async (
  models: IModels,
  fieldId: string,
  values: string[],
): Promise<string[]> => {
  if (!values.length) {
    return [];
  }

  const propertiesDataPath = `propertiesData.${fieldId}`;

  const [fromCustomFieldsData, fromPropertiesData] = await Promise.all([
    models.Deals.aggregate([
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
    models.Deals.aggregate([
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
