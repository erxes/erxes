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

export const buildTarget = (user: IUserDocument | { _id: string }) => ({
  _id: user._id,
});
