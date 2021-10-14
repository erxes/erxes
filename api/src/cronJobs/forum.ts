import * as schedule from 'node-schedule';
import { ForumDiscussions } from '../db/models';
import { debugCrons } from '../debuggers';

const changeExpiredDiscussionStatus = async () => {
  const now = new Date();

  await ForumDiscussions.updateMany(
    {
      closeDate: { $lte: now }
    },
    { $set: { status: 'closed' } }
  );
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
schedule.scheduleJob('0 30 09 * * *', async () => {
  debugCrons('Change the status of expired discussion ....');

  await changeExpiredDiscussionStatus();
});
