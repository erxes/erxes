import * as schedule from 'node-schedule';
import { RABBITMQ_QUEUES } from '../data/constants';
import { Configs } from '../db/models';
import { debugCrons } from '../debuggers';
import messageBroker from '../messageBroker';

const removeOldLogs = async () => {
  const config = await Configs.findOne({ code: 'LOG_DATA_RETENTION' }).lean();
  const months = config ? config.value : 1;

  return messageBroker().sendMessage(RABBITMQ_QUEUES.LOG_DELETE_OLD, {
    months
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
  debugCrons('Remove old logs ....');

  await removeOldLogs();
});
