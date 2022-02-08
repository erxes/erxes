import { INotificationDocument } from '../../models/definitions/notifications';
import { getDocument } from '../../cacheUtils';

export default {
  createdUser(notif: INotificationDocument) {
    return getDocument('users', { _id: notif.createdUser });
  },
};
