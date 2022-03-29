import { IConfig } from '../../models/definitions/notifications';
import { graphqlPubsub } from '../../configs';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

const notificationMutations = {
  /**
   * Save notification configuration
   */
  notificationsSaveConfig(_root, doc: IConfig, { user, models }: IContext) {
    return models.NotificationConfigurations.createOrUpdateConfiguration(
      doc,
      user
    );
  },

  /**
   * Marks notification as read
   */
  async notificationsMarkAsRead(
    _root,
    { _ids, contentTypeId }: { _ids: string[]; contentTypeId: string },
    { models, user }: IContext
  ) {
    // notify subscription
    graphqlPubsub.publish('notificationsChanged', '');

    graphqlPubsub.publish('notificationRead', {
      notificationRead: { userId: user._id },
    });

    let notificationIds = _ids;

    if (contentTypeId) {
      const notifications = await models.Notifications.find({ contentTypeId });

      notificationIds = notifications.map((notification) => notification._id);
    }

    return models.Notifications.markAsRead(notificationIds, user._id);
  },

  /**
   * Show notifications
   */
  async notificationsShow(_root, _args, { user, subdomain }: IContext) {
    graphqlPubsub.publish('userChanged', {
      userChanged: { userId: user._id },
    });

    await sendCoreMessage({
      subdomain,
      action: 'users.updateOne',
      data: {
        selector: { _id: user._id },
        modifier: { $set: { isShowNotification: true } }
      }
    });

    return 'success';
  },
};

moduleRequireLogin(notificationMutations);

export default notificationMutations;
