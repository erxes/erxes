import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { CP_USER_ACTIVITY_FIELDS } from './constants';

export const getCPUserFieldLabel = (field: string) => {
  const match = CP_USER_ACTIVITY_FIELDS.find((item) => item.field === field);
  return match?.label || 'unknown';
};

export function sanitizeCPUserForActor(
  cpUser: ICPUserDocument | { _id: string } | Record<string, unknown>,
): Record<string, unknown> {
  const doc = cpUser && typeof cpUser === 'object' ? cpUser : {};

  return {
    _id: (doc as { _id?: string })._id,
    email: (doc as { email?: string }).email,
    username: (doc as { username?: string }).username,
    firstName: (doc as { firstName?: string }).firstName,
    lastName: (doc as { lastName?: string }).lastName,
    clientPortalId: (doc as { clientPortalId?: string }).clientPortalId,
  };
}
