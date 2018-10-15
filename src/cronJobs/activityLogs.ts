import * as schedule from 'node-schedule';
import QueryBuilder from '../data/resolvers/queries/segmentQueryBuilder';
import { ActivityLogs, Customers, Segments } from '../db/models';

/**
 * Send conversation messages to customer
 */
export const createActivityLogsFromSegments = async () => {
  const segments = await Segments.find({});

  for (const segment of segments) {
    const selector = await QueryBuilder.segments(segment);
    const customers = await Customers.find(selector);

    for (const customer of customers) {
      await ActivityLogs.createSegmentLog(segment, customer);
    }
  }
};

/**
 * *    *    *    *    *    *
 * ┬    ┬    ┬    ┬    ┬    ┬
 * │    │    │    │    │    |
 * │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 * │    │    │    │    └───── month (1 - 12)
 * │    │    │    └────────── day of month (1 - 31)
 * │    │    └─────────────── hour (0 - 23)
 * │    └──────────────────── minute (0 - 59)
 * └───────────────────────── second (0 - 59, OPTIONAL)
 */
schedule.scheduleJob('* 45 23 * *', () => {
  createActivityLogsFromSegments();
});

export default {
  createActivityLogsFromSegments,
};
