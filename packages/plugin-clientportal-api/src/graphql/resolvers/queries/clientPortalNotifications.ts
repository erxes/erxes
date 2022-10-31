// TODO: check if related stages are selected in client portal config
import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const notificationQueries = {
  async clientPortalNotificationCounts(
    _root,
    _args,
    { models, cpUser }: IContext
  ) {
    if (!cpUser) {
      throw new Error('You are not logged in');
    }

    return models.ClientPortalNotifications.find({
      receiver: cpUser._id,
      isRead: false
    }).countDocuments();
  }
};

export default notificationQueries;
