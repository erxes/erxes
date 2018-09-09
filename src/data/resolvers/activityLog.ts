import { ACTIVITY_PERFORMER_TYPES } from '../../data/constants';
import { Users } from '../../db/models';
import { IActivityLogDocument } from '../../db/models/definitions/activityLogs';

/*
 * Placeholder object for ActivityLog resolver (used with graphql)
 */
export default {
  /**
   * Finds id of the activity
   */
  id(obj: IActivityLogDocument) {
    return obj.activity.id;
  },

  /**
   * Finds action of the activity
   */
  action(obj: IActivityLogDocument) {
    return `${obj.activity.type}-${obj.activity.action}`;
  },

  /**
   * Finds content of the activity
   */
  content(obj: IActivityLogDocument) {
    return obj.activity.content;
  },

  /**
   * Finds content of the activity
   */
  async by(obj: IActivityLogDocument) {
    const performedBy = obj.performedBy;

    if (!performedBy) {
      return null;
    }

    if (performedBy.type === ACTIVITY_PERFORMER_TYPES.USER) {
      const user = await Users.findOne({ _id: performedBy.id });

      if (!user) {
        return null;
      }

      return {
        _id: user._id,
        type: performedBy.type,
        details: user.details,
      };
    }

    return {
      type: performedBy.type,
      details: {},
    };
  },
};
