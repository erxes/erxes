import { IUserDocument } from 'erxes-api-shared/core-types';
import { USER_ACTIVITY_FIELDS } from './constants';

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
