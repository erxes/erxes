import * as schedule from 'node-schedule';
import { getSubServiceDomain, sendRequest } from '../data/utils';
import { Configs } from '../db/models';
import { debugCrons, debugError } from '../debuggers';

const removeOldLogs = async () => {
  const config = await Configs.findOne({ code: 'LOG_DATA_RETENTION' }).lean();
  const value = config ? config.value : 1;

  const now = new Date();

  const month = now.getMonth();
  const year = now.getFullYear();
  const date = now.getDate();

  const LOGS_DOMAIN = getSubServiceDomain({ name: 'LOGS_API_DOMAIN' });

  try {
    await sendRequest({
      url: `${LOGS_DOMAIN}/logs`,
      method: 'delete',
      body: {
        query: JSON.stringify({
          createdAt: { $lte: new Date(year, month - value, date) }
        })
      }
    });
  } catch (e) {
    debugError(
      `Failed to connect to logs api. Check whether LOGS_API_DOMAIN env is missing or logs api is not running: ${e.message}`
    );
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
schedule.scheduleJob('0 45 23 * * *', async () => {
  debugCrons('Remove old logs ....');

  await removeOldLogs();
});
