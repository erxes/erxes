import * as dotenv from 'dotenv';
import * as schedule from 'node-schedule';
import { ACTIVITY_LOG_ACTIONS, putActivityLog } from '../data/logUtils';
import { fetchSegment } from '../data/modules/segments/queryBuilder';
import { connect } from '../db/connection';
import { Segments } from '../db/models';

/**
 * Send conversation messages to customer
 */
dotenv.config();

export const createActivityLogsFromSegments = async () => {
  await connect();

  const segments = await Segments.find({ name: { exists: true } });

  for (const segment of segments) {
    if (!segment.shouldWriteActivityLog) {
      continue;
    }
    const result = await fetchSegment(segment, { returnFullDoc: true });

    const contentIds = result.map(c => c._id) || [];

    await putActivityLog({
      action: ACTIVITY_LOG_ACTIONS.CREATE_SEGMENT_LOG,
      data: { segment, contentIds, type: segment.contentType }
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
schedule.scheduleJob('0 45 23 * * *', () => {
  createActivityLogsFromSegments();
});
