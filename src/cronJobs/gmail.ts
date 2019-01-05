import * as schedule from 'node-schedule';
import { Integrations } from '../db/models';
import { updateHistoryId } from '../trackers/gmail';

/**
 * Send conversation messages to customer
 */
export const callGmailUsersWatch = async () => {
  const integrations = await Integrations.find({
    gmailData: { $exists: true },
  });

  for (const integration of integrations) {
    await updateHistoryId(integration);
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
  callGmailUsersWatch();
});

export default {
  callGmailUsersWatch,
};
