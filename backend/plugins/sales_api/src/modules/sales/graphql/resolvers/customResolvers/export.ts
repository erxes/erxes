import { Resolver } from 'erxes-api-shared/core-types';

const exportResolvers: Record<string, Resolver> = {
  async getExportHeaders(_root, { moduleName, collectionName }) {
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

      const items = await (models as any).PosItems.find()
        .limit(MAX_EXPORT)
        .lean();

      return items.map((item: any) => ({
        number: item.number,
        createdAt: item.createdAt,
      }));
    }

    return [];
  },
};

export default exportResolvers;