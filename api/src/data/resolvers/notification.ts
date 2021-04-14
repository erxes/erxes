import { INotificationDocument } from '../../db/models/definitions/notifications';
import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(notif: INotificationDocument) {
    return getDocument('users', { _id: notif.createdUser });
  }
};
