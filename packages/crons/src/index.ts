import * as schedule from 'node-schedule';

import { doesQueueExist } from '@erxes/api-utils/src/messageBroker';
import { initBroker, sendCommonMessage } from './messageBroker';
import { redis, getServices, isAvailable } from './serviceDiscovery';

const { RABBITMQ_HOST } = process.env;

initBroker({ RABBITMQ_HOST, redis })
  .then(async () => {
    console.log('Crons is running ....');
    const services = await getServices();

    for (const serviceName of services) {
      if (await isAvailable(serviceName)) {
        const subdomain = 'os';

        // every minute at 1sec
        schedule.scheduleJob('1 * * * * *', async () => {
          console.log('every minute ....', services);
          const minutelyAction = 'handleMinutelyJob';
          const exists = await doesQueueExist(serviceName, minutelyAction);

          if (exists) {
            sendCommonMessage({
              subdomain,
              serviceName,
              action: minutelyAction,
              data: { subdomain }
            });
          }
        });

        // every hour at 10min:10sec
        schedule.scheduleJob('10 10 * * * *', async () => {
          console.log('every hour ....', services);
          const hourlyAction = 'handleHourlyJob';
          const exists = await doesQueueExist(serviceName, hourlyAction);

          if (exists) {
            sendCommonMessage({
              subdomain,
              serviceName,
              action: hourlyAction,
              data: { subdomain }
            });
          }
        });

        // every day at 11hour:20min:20sec
        schedule.scheduleJob('20 20 11 * * *', async () => {
          console.log('every day ....', services);
          const dailyAction = 'handleDailyJob';
          const exists = await doesQueueExist(serviceName, dailyAction);

          if (exists) {
            sendCommonMessage({
              subdomain,
              serviceName,
              action: dailyAction,
              data: { subdomain }
            });
          }
        });
      } // end isAvailable if
    }
  })
  .catch(e =>
    console.log(`Error ocurred during message broker init ${e.message}`)
  );
