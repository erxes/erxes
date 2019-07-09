import { NotificationConfigurations, Notifications } from '../../../db/models';
import { IConfig } from '../../../db/models/definitions/notifications';
import { IUserDocument } from '../../../db/models/definitions/users';
import { graphqlPubsub } from '../../../pubsub';
import { moduleRequireLogin } from '../../permissions/wrappers';

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
  notificationsSaveConfig(_root, doc: IConfig, { user }: { user: IUserDocument }) {
    return NotificationConfigurations.createOrUpdateConfiguration(doc, user);
  },

  /**
   * Marks notification as read
   */
  notificationsMarkAsRead(_root, { _ids }: { _ids: string[] }, { user }: { user: IUserDocument }) {
    // notify subscription
    graphqlPubsub.publish('notificationsChanged', '');

    return Notifications.markAsRead(_ids, user._id);
  },
};

moduleRequireLogin(notificationMutations);

export default notificationMutations;
