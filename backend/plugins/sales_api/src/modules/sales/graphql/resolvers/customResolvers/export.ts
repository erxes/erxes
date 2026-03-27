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
};

export default exportResolvers;
