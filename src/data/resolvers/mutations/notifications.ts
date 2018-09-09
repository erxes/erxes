import { NotificationConfigurations, Notifications } from '../../../db/models';
import { IConfig } from '../../../db/models/definitions/notifications';
import { IUserDocument } from '../../../db/models/definitions/users';
import { moduleRequireLogin } from '../../permissions';
import { pubsub } from '../subscriptions';

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
    pubsub.publish('notificationsChanged', '');

    return Notifications.markAsRead(_ids, user._id);
  },
};

moduleRequireLogin(notificationMutations);

export default notificationMutations;
