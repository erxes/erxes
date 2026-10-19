import { type IUser } from 'ui-modules';

export const getUserDisplayName = (user?: IUser) =>
  user?.details?.fullName || user?.email || 'Unknown user';
