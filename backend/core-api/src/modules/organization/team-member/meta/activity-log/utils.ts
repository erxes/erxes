import { IUserDocument } from 'erxes-api-shared/core-types';
import { USER_ACTIVITY_FIELDS } from './constants';
import { IModels } from '~/connectionResolvers';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';

export const getFieldLabel = (field: string) => {
  if (field.startsWith('links.')) {
    const [, key] = field.split('.');
    return `${key} link`;
  }

  const match = USER_ACTIVITY_FIELDS.find((item) => item.field === field);
  return match?.label || field;
};

export const buildTarget = (
  user: IUserDocument | { _id: string } | undefined,
) => {
  if (!user) {
    return {
      _id: 'unknown',
      moduleName: 'organization',
      collectionName: 'users',
      text: 'Unknown user',
    };
  }

  const targetUser = user as Partial<IUserDocument> & { _id: string };

  return {
    _id: targetUser._id,
    moduleName: 'organization',
    collectionName: 'users',
    text:
      targetUser.details?.fullName ||
      targetUser.username ||
      targetUser.email ||
      (targetUser._id ? `User ${targetUser._id}` : 'this member'),
  };
};

export const getPermissionGroupLabels = async (
  models: IModels,
  ids: string[],
): Promise<string[]> => {
  if (!ids.length) {
    return [];
  }

  const defaultGroupIds = ids.filter((id) => id.includes(':'));
  const customPermissionGroupIds = ids.filter((id) => !id.includes(':'));

  let labelMap = new Map();
  if (customPermissionGroupIds?.length) {
    const customPermissionGroups = await models.PermissionGroups.find(
      { _id: { $in: customPermissionGroupIds } },
      { name: 1 },
    ).lean();
    labelMap = new Map(
      customPermissionGroups.map((group: any) => [
        String(group._id),
        group.name,
      ]),
    );
  }

  if (defaultGroupIds.length) {
    const defaultGroups: any[] = [];
    const services = await getPlugins();

    for (const serviceName of services) {
      const service = await getPlugin(serviceName);
      const groups = service?.config?.meta?.permissions?.defaultGroups || [];

      defaultGroups.push(...groups);
    }

    for (const group of defaultGroups) {
      if (!labelMap.has(group.id)) {
        labelMap.set(group.id, group.name);
      }
    }
  }

  return ids
    .map((id) => labelMap.get(id))
    .filter((label): label is string => !!label);
};
