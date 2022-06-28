import { INotificationDocument } from '../../models/definitions/notifications';

export default {
  createdUser(notif: INotificationDocument) {
    return (
      notif.createdUser && {
        __typename: 'User',
        _id: notif.createdUser
      }
    );
  }
};
