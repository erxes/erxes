import { Resolver } from 'erxes-api-shared/core-types';

type PosItem = {
  number?: string;
  createdAt?: Date;
};

const exportResolvers: Record<string, Resolver> = {
  getExportHeaders(_root, { moduleName, collectionName }) {
    if (moduleName === 'pos' && collectionName === 'posItems') {
      return [
        {
          key: 'number',
          label: 'Number',
          isDefault: true,
          type: 'string',
        },
        {
          key: 'createdAt',
          label: 'Created Date',
          isDefault: true,
          type: 'date',
        },
      ];
    }

    return [];
  },

  async getExportData(_root, { moduleName, collectionName }, { models }) {
    if (moduleName === 'pos' && collectionName === 'posItems') {
      const MAX_EXPORT = 10000;

      const items: PosItem[] = await models.PosOrders.aggregate([
        { $unwind: '$items' },
        { $limit: MAX_EXPORT },
        {
          $project: {
            number: '$items.number',
            createdAt: '$createdAt',
          },
        },
      ]);

      return items.map((item) => ({
        number: item.number,
        createdAt: item.createdAt,
      }));
    }

    return [];
  },
};

export default exportResolvers;
