import * as schedule from 'node-schedule';
import { Configs, Notifications } from '../db/models';
import { debugCrons } from '../debuggers';

const removeOldNotifications = async () => {
  const config = await Configs.findOne({ code: 'NOTIFICATION_DATA_RETENTION' });
  const value = config ? config.value : 3;

  const now = new Date();

  const month = now.getMonth();
  const year = now.getFullYear();
  const date = now.getDate();

  await Notifications.deleteMany({
    date: { $lte: new Date(year, month - value, date) }
  });
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
schedule.scheduleJob('0 45 23 * * *', async () => {
  debugCrons('Remove old notifications ....');

  await removeOldNotifications();
});
