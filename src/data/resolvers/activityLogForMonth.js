import { ActivityLogs } from '../../db/models';

export default {
  date(obj) {
    return obj.date.yearMonth;
  },

  list(obj) {
    return ActivityLogs.find({
      'coc.type': obj.customerType,
      'coc.id': obj.customer._id,
      createdAt: {
        $gte: obj.date.interval.start,
        $lt: obj.date.interval.end,
      },
    }).sort({ createdAt: -1 });
  },
};
