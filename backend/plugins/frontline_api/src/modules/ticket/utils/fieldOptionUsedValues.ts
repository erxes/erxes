import { IFieldOptionUsageCount } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const getTicketFieldOptionUsedValues = async (
  models: IModels,
  fieldId: string,
  values: string[],
): Promise<IFieldOptionUsageCount[]> => {
  if (!values.length) {
    return [];
  }

  const propertiesDataPath = `propertiesData.${fieldId}`;

  const rows: Array<{ _id: string; count: number }> =
    await models.Ticket.aggregate([
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
    ]);

  return rows.map((row) => ({ value: row._id, count: row.count }));
};
