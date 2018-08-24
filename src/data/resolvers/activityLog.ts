import { ACTIVITY_PERFORMER_TYPES } from "../../data/constants";
import { Users } from "../../db/models";

/*
 * Placeholder object for ActivityLog resolver (used with graphql)
 */
export default {
  /**
   * Finds id of the activity
   * @param {ActivityLog} obj - ActivityLog model document
   * @return {String} returns id of the activity
   */
  id(obj) {
    return obj.activity.id;
  },

  /**
   * Finds action of the activity
   * @param {ActivityLog} obj - ActivityLog model document
   * @return {String} returns action of the activity
   */
  action(obj) {
    return `${obj.activity.type}-${obj.activity.action}`;
  },

  /**
   * Finds content of the activity
   * @param {ActivityLog} obj - ActivityLog model document
   * @return {String} returns content of the activity
   */
  content(obj) {
    return obj.activity.content;
  },

  /**
   * Finds content of the activity
   * @param {ActivityLog} obj - ActivityLog model document
   * @return {Object} returns details with his/her id
   */
  async by(obj) {
    const performedBy = obj.performedBy;
    if (performedBy.type === ACTIVITY_PERFORMER_TYPES.USER) {
      const user = await Users.findOne({ _id: performedBy.id });
      return {
        _id: user._id,
        type: performedBy.type,
        details: user.details
      };
    }
    return {
      type: performedBy.type,
      details: {}
    };
  }
};
