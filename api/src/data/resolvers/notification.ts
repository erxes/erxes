import { Users } from '../../db/models';
import { INotificationDocument } from '../../db/models/definitions/notifications';

export default {
  createdUser(notif: INotificationDocument) {
    return Users.findOne({ _id: notif.createdUser });
  },
};
