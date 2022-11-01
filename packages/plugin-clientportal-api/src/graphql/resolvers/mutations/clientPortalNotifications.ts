import { IContext } from '../../../connectionResolver';

const notificationMutations = {
  clientPortalNotificationsMarkAsRead(
    _root,
    { _ids }: { _ids: string[] },
    { models, cpUser }: IContext
  ) {
    if (!cpUser) {
      throw new Error('You are not logged in');
    }

    return models.ClientPortalNotifications.markAsRead(_ids, cpUser._id);
  }
};

export default notificationMutations;
