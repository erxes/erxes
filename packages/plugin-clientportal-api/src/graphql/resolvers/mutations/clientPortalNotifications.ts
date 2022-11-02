import { graphqlPubsub } from '../../../configs';
import { IContext } from '../../../connectionResolver';

const notificationMutations = {
  async clientPortalNotificationsMarkAsRead(
    _root,
    { _ids }: { _ids: string[] },
    { models, cpUser }: IContext
  ) {
    if (!cpUser) {
      throw new Error('You are not logged in');
    }

    graphqlPubsub.publish('clientPortalNotificationRead', {
      notificationRead: { userId: cpUser._id }
    });

    await models.ClientPortalNotifications.markAsRead(_ids, cpUser._id);

    return 'marked';
  }
};

export default notificationMutations;
