import * as dotenv from 'dotenv';
import * as schedule from 'node-schedule';
import { IModels } from '../connectionResolver';
import { fetchSegment } from '../graphql/resolvers/queries/queryBuilder';
import { putActivityLog } from '../logUtils'

/**
 * Send conversation messages to customer
 */
export const createActivityLogsFromSegments = async (
  models: IModels,
  subdomain: string
) => {
  const segments = await models.Segments.find({ name: { $exists: true } });

  for (const segment of segments) {
    if (!segment.shouldWriteActivityLog) {
      continue;
    }
    const result = await fetchSegment(models, subdomain, segment, {
      returnFullDoc: true
    });

    const contentIds = result.map(c => c._id) || [];

    await putActivityLog(subdomain, {
      action: 'createSegmentLog',
      data: { segment, contentIds, contentType: segment.contentType }
    });
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
// schedule.scheduleJob('0 45 23 * * *', () => {
//   createActivityLogsFromSegments();
// });
