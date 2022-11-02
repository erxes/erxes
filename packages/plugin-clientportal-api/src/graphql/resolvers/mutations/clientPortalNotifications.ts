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
      clientPortalNotificationRead: { userId: cpUser._id }
    });

    await models.ClientPortalNotifications.markAsRead(_ids, cpUser._id);

    return 'marked';
  },

  async clientPortalNotificationsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models, cpUser }: IContext
  ) {
    if (!cpUser) {
      throw new Error('You are not logged in');
    }

    for (const _id of _ids) {
      await models.ClientPortalNotifications.removeNotification(
        _id,
        cpUser._id
      );
    }

    return 'removed';
  }
};

export default notificationMutations;
