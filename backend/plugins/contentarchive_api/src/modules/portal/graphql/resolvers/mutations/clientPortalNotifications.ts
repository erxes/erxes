import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { INotifcationSettings } from '@/portal/@types/user';

const notificationMutations = {
  async clientPortalNotificationsMarkAsRead(
    _root,
    { _ids, markAll }: { _ids: string[]; markAll: boolean },
    { models, portalUser }: IContext,
  ) {
    let cpNotifIds = _ids;

    // mark all notifs as read
    if (markAll) {
      cpNotifIds = (await models.Notifications.find({ isRead: false })).map(
        (notif) => notif._id,
      );
    }

    if (!portalUser) {
      throw new Error('You are not logged in');
    }

    const publish = graphqlPubsub.publish as <T>(
      trigger: string,
      payload: T,
    ) => Promise<void>;

    await publish(`clientPortalNotificationRead:${portalUser._id}`, {
      clientPortalNotificationRead: { userId: portalUser._id },
    });

    await models.Notifications.markAsRead(cpNotifIds, portalUser._id);

    return 'marked';
  },

  async clientPortalNotificationsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models, portalUser }: IContext,
  ) {
    if (!portalUser) {
      throw new Error('You are not logged in');
    }

    for (const _id of _ids) {
      await models.Notifications.removeNotification(_id, portalUser._id);
    }

    return 'removed';
  },

  async clientPortalUserUpdateNotificationSettings(
    _root,
    doc: INotifcationSettings,
    { models, portalUser }: IContext,
  ) {
    if (!portalUser) {
      throw new Error('You are not logged in');
    }

    await models.Users.updateNotificationSettings(portalUser._id, doc);

    return models.Users.findOne({ _id: portalUser._id });
  },

  async clientPortalSendNotification(
    _root,
    { _id, ...doc }: any,
    { models }: IContext,
  ) {
    try {
      // await sendNotification(models, subdomain, doc);
      return 'success';
    } catch (e) {
      throw new Error(e.message);
    }
  },
};

export default notificationMutations;
