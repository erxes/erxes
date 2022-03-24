import * as dotenv from 'dotenv';
import * as schedule from 'node-schedule';
import { fetchSegment } from './graphql/resolvers/queries/queryBuilder';
import { sendRPCMessage } from './messageBroker';
import { Segments } from './models';
import { ISegmentDocument } from './models/definitions/segments';

const putSegmentLogs = async (
  segment: ISegmentDocument,
  contentIds: string[]
) => {
  const maxBulk: number = 10000;

  const activityLogs = await sendRPCMessage('logs:activityLogs:findMany', {
    query: {
      action: 'segment',
      contentId: { $in: contentIds },
      contentType: segment.contentType,
      'content.id': segment._id
    },
    options: { contentId: 1 }
  });

  const foundContentIds = activityLogs.map(s => s.contentId);

  const diffContentIds = contentIds.filter(x => !foundContentIds.includes(x));

  let bulkOpt: Array<{
    contentType: string;
    contentId: string;
    action: string;
    content: {};
  }> = [];

  let bulkCounter = 0;

  for (const contentId of diffContentIds) {
    bulkCounter = bulkCounter + 1;

    const doc = {
      contentType: segment.contentType,
      contentId,
      action: 'segment',
      content: {
        id: segment._id,
        content: segment.name
      }
    };

    bulkOpt.push(doc);

    if (bulkCounter === maxBulk) {
      await sendRPCMessage('logs.activityLogs.insertMany', { rows: bulkOpt });

      bulkOpt = [];
      bulkCounter = 0;
    }
  }

  if (bulkOpt.length === 0) {
    return;
  }

  return sendRPCMessage('logs.activityLogs.insertMany', { rows: bulkOpt });
};

/**
 * Send conversation messages to customer
 */
dotenv.config();

export const createActivityLogsFromSegments = async () => {
  const segments = await Segments.find({ name: { exists: true } });

  for (const segment of segments) {
    if (!segment.shouldWriteActivityLog) {
      continue;
    }
    const result = await fetchSegment(segment, { returnFullDoc: true });

    const contentIds = result.map(c => c._id) || [];

    await putSegmentLogs(segment, contentIds);
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
