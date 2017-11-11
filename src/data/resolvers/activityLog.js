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
};
