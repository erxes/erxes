import { Resolver } from 'erxes-api-shared/core-types';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules/permissions/utils';

const exportResolvers: Record<string, Resolver> = {
  async getExportHeaders(
    _root,
    { moduleName, collectionName },
    { user, subdomain },
  ) {
    const checkPermission = checkPermissionGroup(subdomain, user);
    await checkPermission('export');

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

  async getExportData(
    _root,
    { moduleName, collectionName },
    { models, user, subdomain },
  ) {
    const checkPermission = checkPermissionGroup(subdomain, user);
    await checkPermission('export');

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
