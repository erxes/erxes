import { INotificationDocument } from '../../models/definitions/notifications';

export default {
  createdUser(notif: INotificationDocument) {
    return {
      __typename: 'User',
      _id: notif.createdUser
    }
  },
};
