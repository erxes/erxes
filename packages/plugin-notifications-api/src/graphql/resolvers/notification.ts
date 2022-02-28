import { Users } from '../../apiCollections';
import { INotificationDocument } from '../../models/definitions/notifications';

export default {
  createdUser(notif: INotificationDocument) {
    return Users.findOne({ _id: notif.createdUser });
  },
};
