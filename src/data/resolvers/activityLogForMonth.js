import { ActivityLogs } from '../../db/models';

export default {
  date(obj) {
    return obj.date.yearMonth;
  },

  list(obj) {
    return ActivityLogs.find({
      'customer.type': obj.customerType,
      'customer.id': obj.customer._id,
      createdAt: {
        $gte: obj.date.interval.start,
        $lte: obj.date.interval.end,
      },
    });
  },
};
