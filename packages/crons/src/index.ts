import * as schedule from 'node-schedule';

import { doesQueueExist } from '@erxes/api-utils/src/messageBroker';
import { initBroker, sendCommonMessage } from './messageBroker';
import { redis, getServices, isAvailable } from './serviceDiscovery';

const { RABBITMQ_HOST } = process.env;

const sendMessage = async (
  subdomain: string,
  action: string,
  services: string[]
) => {
  for (const serviceName of services) {
    if (await isAvailable(serviceName)) {
      const exists = await doesQueueExist(serviceName, action);

      if (exists) {
        sendCommonMessage({
          subdomain,
          serviceName,
          action,
          data: { subdomain }
        });
      }
    }
  }
};

initBroker({ RABBITMQ_HOST, redis })
  .then(async () => {
    console.log('Crons is running ....');
    const services = await getServices();
    const subdomain = 'os';

    // every minute at 1sec
    schedule.scheduleJob('1 * * * * *', async () => {
      console.log('every minute ....', services);

      await sendMessage(subdomain, 'handleMinutelyJob', services);
    });

    // every hour at 10min:10sec
    schedule.scheduleJob('10 10 * * * *', async () => {
      console.log('every hour ....', services);

      await sendMessage(subdomain, 'handleHourlyJob', services);
    });

    // every day at 11hour:20min:20sec
    schedule.scheduleJob('20 20 11 * * *', async () => {
      console.log('every day ....', services);

      await sendMessage(subdomain, 'handleDailyJob', services);
    });
  })
  .catch(e =>
    console.log(`Error ocurred during message broker init ${e.message}`)
  );
