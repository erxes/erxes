// TODO: to check obj type

/*
 * Placeholder object for ActivityLogForMonth resolver (used with graphql)
 */
export default {
  /**
   * Returns current date interval
   */
  date(obj) {
    return obj.date.yearMonth;
  },

  /**
   * Returns a list of activity logs present in the given date interval
   */
  list() {
    return [];
  },
};
