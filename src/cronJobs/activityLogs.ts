import * as dotenv from 'dotenv';
import * as schedule from 'node-schedule';
import { fetchBySegments } from '../data/modules/segments/queryBuilder';
import { connect } from '../db/connection';
import { ActivityLogs, Companies, Customers, Segments } from '../db/models';

/**
 * Send conversation messages to customer
 */
dotenv.config();

export const createActivityLogsFromSegments = async () => {
  await connect();
  const segments = await Segments.find({});

  for (const segment of segments) {
    const ids = await fetchBySegments(segment);

    const customers = await Customers.find({ _id: { $in: ids } }, { _id: 1 });
    const customerIds = customers.map(c => c._id);

    const companies = await Companies.find({ _id: { $in: ids } }, { _id: 1 });
    const companyIds = companies.map(c => c._id);

    await ActivityLogs.createSegmentLog(segment, customerIds, 'customer');

    await ActivityLogs.createSegmentLog(segment, companyIds, 'company');
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
schedule.scheduleJob('0 45 23 * * *', () => {
  createActivityLogsFromSegments();
});
