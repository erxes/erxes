import {
  NotificationConfigurations,
  Notifications,
  Users
} from '../../../db/models';
import { IConfig } from '../../../db/models/definitions/notifications';
import { graphqlPubsub } from '../../../pubsub';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const notificationMutations = {
  /**
   * Save notification configuration
   */
  notificationsSaveConfig(_root, doc: IConfig, { user }: IContext) {
    return NotificationConfigurations.createOrUpdateConfiguration(doc, user);
  },

  /**
   * Marks notification as read
   */
  async notificationsMarkAsRead(
    _root,
    { _ids, contentTypeId }: { _ids: string[]; contentTypeId: string },
    { user }: IContext
  ) {
    // notify subscription
    graphqlPubsub.publish('notificationsChanged', '');

    graphqlPubsub.publish('notificationRead', {
      notificationRead: { userId: user._id }
    });

    let notificationIds = _ids;

    if (contentTypeId) {
      const notifications = await Notifications.find({ contentTypeId });

      notificationIds = notifications.map(notification => notification._id);
    }

    return Notifications.markAsRead(notificationIds, user._id);
  },

  /**
   * Show notifications
   */
  async notificationsShow(_root, _args, { user }: IContext) {
    graphqlPubsub.publish('userChanged', {
      userChanged: { userId: user._id }
    });

    await Users.updateOne(
      { _id: user._id },
      { $set: { isShowNotification: true } }
    );

    return 'success';
  }
};

moduleRequireLogin(notificationMutations);

export default notificationMutations;
