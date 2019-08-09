import { ActivityLogs } from '../../../db/models';
import { IActivityLog } from '../../../db/models/definitions/activityLogs';
import { moduleRequireLogin } from '../../permissions/wrappers';

const activityLogQueries = {
  /**
   * Get activity log list
   */
  activityLogs(_root, doc: IActivityLog) {
    const { contentType, contentId, activityType, limit } = doc;

    const query = { 'contentType.type': contentType, 'contentType.id': contentId };

    if (activityType) {
      query['activity.type'] = activityType;
    }

    const sort = { createdAt: -1 };

    return ActivityLogs.find(query)
      .sort(sort)
      .limit(limit);
  },
};

moduleRequireLogin(activityLogQueries);

export default activityLogQueries;
