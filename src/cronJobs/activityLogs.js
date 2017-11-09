import schedule from 'node-schedule';
import { Segments, Customers, ActivityLogs } from '../db/models';
import QueryBuilder from '../segmentQueryBuilder';

/**
* Send conversation messages to customer
*/
export const createActivityLogsFromSegments = async () => {
  const segments = await Segments.find({});

  for (let segment of segments) {
    const selector = await QueryBuilder.segments(segment);
    // console.log('segment: ', segment);
    // console.log('selector: ', selector['$and'] && selector['$and'][0]['$or']);
    const customers = await Customers.find(selector);

    if (segment.contentType) {
      for (let customer of customers) {
        // console.log('customer: ', customer);

        await ActivityLogs.createSegmentLog(segment, customer);
      }
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
// every 10 minutes
// schedule.scheduleJob('*/5 * * * *', function() {
//   createActivityLogsFromSegments();
// });

export default {
  createActivityLogsFromSegments,
};
