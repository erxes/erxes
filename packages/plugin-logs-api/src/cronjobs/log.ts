import * as schedule from 'node-schedule';
import { IModels } from '../connectionResolver';
// import { debugCrons } from '../debuggers';
import { sendCoreMessage } from '../messageBroker';

export const removeOldLogs = async (models: IModels, subdomain: string) => {
  const config = await sendCoreMessage({
    subdomain,
    action: 'configs.findOne',
    data: {
      query: {
        code: 'LOG_DATA_RETENTION'
      }
    },
    isRPC: true
  });

  const months = config ? config.value : 1;

  const now = new Date();
  return models.Logs.deleteMany({
    createdAt: {
      $lte: new Date(
        now.getFullYear(),
        now.getMonth() - months,
        now.getDate()
      )
    }
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

// schedule.scheduleJob('0 45 23 * * *', async () => {
//   debugCrons('Remove old logs ....');

//   await removeOldLogs();
// });
