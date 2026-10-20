import { type TNotification } from 'ui-modules';

export const getUserDisplayName = (fromUser: TNotification['fromUser']) =>
  fromUser?.details?.fullName || fromUser?.email || 'Unknown user';
