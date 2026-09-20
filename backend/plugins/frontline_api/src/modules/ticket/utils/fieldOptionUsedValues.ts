import { IModels } from '~/connectionResolvers';

export const getTicketFieldOptionUsedValues = async (
  models: IModels,
  fieldId: string,
  values: string[],
): Promise<string[]> => {
  if (!values.length) {
    return [];
  }

  const propertiesDataPath = `propertiesData.${fieldId}`;

  const rows: Array<{ _id: string }> = await models.Ticket.aggregate([
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
  ]);

  return rows.map((row) => row._id);
};
