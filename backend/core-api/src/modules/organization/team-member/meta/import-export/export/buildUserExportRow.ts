import { IUserDocument } from 'erxes-api-shared/core-types';
import { defaultUserFieldFormatter } from '../utils';

const joinNames = (ids: string[] | undefined, map?: Map<string, string>) => {
  if (!ids?.length) return '';
  return ids
    .map((id) => map?.get(String(id)) || id)
    .filter(Boolean)
    .join('; ');
};

const getDeepValue = (obj: any, path: string) => {
  if (!path.includes('.')) return obj?.[path];
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

export const buildUserExportRow = (
  user: IUserDocument,
  selectedFields?: string[],
  maps?: {
    brandMap?: Map<string, string>;
    structureEntityMap?: Map<string, string[]>;
  },
  formatter = defaultUserFieldFormatter,
): Record<string, any> => {
  const formatValue = formatter || defaultUserFieldFormatter;

  const { brandMap, structureEntityMap } = maps || {};

  const allFields: Record<string, any> = {
    _id: formatValue(user._id),

    username: formatValue(user.username),
    email: formatValue(user.email),
    employeeId: formatValue(user.employeeId),
    isActive: formatValue(user.isActive),

    'details.firstName': formatValue(user?.details?.firstName),
    'details.middleName': formatValue(user?.details?.middleName),
    'details.lastName': formatValue(user?.details?.lastName),
    'details.shortName': formatValue(user?.details?.shortName),
    'details.fullName': formatValue(user?.details?.fullName),
    'details.birthDate': formatValue(
      user?.details?.birthDate ? new Date(user.details.birthDate) : '',
    ),
    'details.workStartedDate': formatValue(
      user?.details?.workStartedDate ? new Date(user.details.workStartedDate) : '',
    ),
    'details.location': formatValue(user?.details?.location),
    'details.description': formatValue(user?.details?.description),
    'details.operatorPhone': formatValue(user?.details?.operatorPhone),


    brandIds: formatValue(joinNames(user.brandIds, brandMap)),
    structureEntities: formatValue(structureEntityMap?.get(user._id)),


    createdAt: formatValue(user.createdAt ? new Date(user.createdAt) : ''),
  };

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(user._id || '') };

    for (const key of selectedFields) {
      if (key === 'brandIds')
        result[key] = formatValue(joinNames(user.brandIds, brandMap));
      else if (key === 'structureEntities')
        result[key] = formatValue(structureEntityMap?.get(user._id));
      else result[key] = formatValue(getDeepValue(user, key));
    }

    return result;
  }

  return allFields;
};
