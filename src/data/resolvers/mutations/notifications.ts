import { NotificationConfigurations, Notifications } from '../../../db/models';
import { IConfig } from '../../../db/models/definitions/notifications';
import { graphqlPubsub } from '../../../pubsub';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

/**
 * Check user ids whether its added or removed from array of ids
 */
export const checkUserIds = (oldUserIds: string[], newUserIds: string[]) => {
  const removedUserIds = oldUserIds.filter(e => !newUserIds.includes(e));

  const addedUserIds = newUserIds.filter(e => !oldUserIds.includes(e));

  return { addedUserIds, removedUserIds };
};

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
    { user }: IContext,
  ) {
    // notify subscription
    graphqlPubsub.publish('notificationsChanged', '');

    let notificationIds = _ids;

    if (contentTypeId) {
      const notifications = await Notifications.find({ contentTypeId });

      notificationIds = notifications.map(notification => notification._id);
    }

    return Notifications.markAsRead(notificationIds, user._id);
  },
};

moduleRequireLogin(notificationMutations);

export default notificationMutations;
