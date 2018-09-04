import { ActivityLogs } from '../../db/models';

/*
 * Placeholder object for ActivityLogForMonth resolver (used with graphql)
 */
export default {
  /**
   * Returns current date interval
   * @param {Object} obj
   * @param {Object} obj.date
   * @param {Object} obj.date.interval - On object representing month of a year
   * @param {Object} obj.date.interval.start - Date object representing start of a month
   * @param {Object} obj.date.interval.end - Date object representing end of a month
   * @param {Object} obj.date.yearMonth - A dictionary containing year and month int values
   * @param {string} obj.contenType - COC_CONTENT_TYPES string
   * @param {string} obj.coc - customer or company document/object with _id set
   * @return {Object}  returns Object {month: int, year: int}
   */
  date(obj) {
    return obj.date.yearMonth;
  },

  /**
   * Returns a list of activity logs present in the given date interval
   * @param {Object} obj
   * @param {Object} obj.date
   * @param {Object} obj.date.interval - On object representing month of a year
   * @param {Object} obj.date.interval.start - Date object representing start of a month
   * @param {Object} obj.date.interval.end - Date object representing end of a month
   * @param {Object} obj.date.yearMonth - A dictionary containing year and month int values
   * @param {string} obj.contenType - COC_CONTENT_TYPES string
   * @param {string} obj.coc - customer or company document/object with _id set
   * @return {Promise} returns a Promise resolving a list of ActivityLog resolvers
   */
  list(obj) {
    return ActivityLogs.find({
      'coc.type': obj.cocContentType,
      'coc.id': obj.coc._id,
      createdAt: {
        $gte: obj.date.interval.start,
        $lt: obj.date.interval.end,
      },
    }).sort({ createdAt: -1 });
  },
};
