import * as schedule from 'node-schedule';
import { initBroker, sendCommonMessage } from './messageBroker';
import {
  getServices,
  getService,
  isEnabled,
} from '@erxes/api-utils/src/serviceDiscovery';

const sendMessage = async (
  subdomain: string,
  action: string,
  services: string[],
) => {
  for (const serviceName of services) {
    const service = await getService(serviceName);

    if ((await isEnabled(serviceName)) && service) {
      const meta = service.config ? service.config.meta : {};

      if (meta && meta.cronjobs && meta.cronjobs[`${action}Available`]) {
        sendCommonMessage({
          subdomain,
          serviceName,
          action,
          data: { subdomain },
        });
      }
    }
  }
};

initBroker()
  .then(async () => {
    console.log('Crons is running ....');

    const services = await getServices();
    const subdomain = 'os';

    // every 3sec
    schedule.scheduleJob('*/3 * * * * *', async () => {
      console.log('every 3 second ....', services);

      await sendMessage(subdomain, 'handle3SecondlyJob', services);
    });
    // every minute at 1sec
    schedule.scheduleJob('1 * * * * *', async () => {
      console.log('every minute ....', services);

      await sendMessage(subdomain, 'handleMinutelyJob', services);
    });

    // every 10 minute at 1sec
    schedule.scheduleJob('*/10 * * * *', async () => {
      console.log('every 10 minute ....', services);

      await sendMessage(subdomain, 'handle10MinutelyJob', services);
    });

    // every hour at 10min:10sec
    schedule.scheduleJob('10 10 * * * *', async () => {
      console.log('every hour ....', services);

      await sendMessage(subdomain, 'handleHourlyJob', services);
    });

    // every day at 04hour:20min:20sec (UTC)
    schedule.scheduleJob('20 20 20 * * *', async () => {
      console.log('every day ....', services);

      await sendMessage(subdomain, 'handleDailyJob', services);
    });
  })
  .catch((e) =>
    console.log(`Error ocurred during message broker init ${e.message}`),
  );
