import { ActivityLogs } from '../../db/models';

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
