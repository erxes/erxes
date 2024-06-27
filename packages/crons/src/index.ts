import * as schedule from 'node-schedule';
import { initBroker, sendCommonMessage } from './messageBroker';
import {
  getServices,
  getService,
  isEnabled,
} from '@erxes/api-utils/src/serviceDiscovery';

import * as Sentry from "@sentry/node";

const { SENTRY_URL } = process.env

if (SENTRY_URL) {
  Sentry.init({
    dsn: SENTRY_URL,
    tracesSampleRate: 1.0,
  });
}

const sendMessage = async (
  subdomain: string,
  action: string,
  services: string[],
) => {
  const commonMessage = async () => {
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
  }

  return SENTRY_URL ? Sentry.withMonitor(action, async () => { return commonMessage() }) : commonMessage()
};

initBroker()
  .then(async () => {
    console.log('Crons is running ....');

    const services = await getServices();
    const subdomain = 'os';

    const scheduler = SENTRY_URL ? Sentry.cron.instrumentNodeSchedule(schedule) : schedule

    // every minute at 1sec
    scheduler.scheduleJob(SENTRY_URL && "handleMinutelyJob", '1 * * * * *', async () => {
      console.log('every minute ....', services);

      await sendMessage(subdomain, 'handleMinutelyJob', services);
    });

    // every 10 minute at 1sec
    scheduler.scheduleJob(SENTRY_URL && "handle10MinutelyJob", '*/10 * * * *', async () => {
      console.log('every 10 minute ....', services);

      await sendMessage(subdomain, 'handle10MinutelyJob', services);
    });

    // every hour at 10min:10sec
    scheduler.scheduleJob(SENTRY_URL && "handleHourlyJob", '10 10 * * * *', async () => {
      console.log('every hour ....', services);

      await sendMessage(subdomain, 'handleHourlyJob', services);
    });

    // every day at 04hour:20min:20sec (UTC)
    scheduler.scheduleJob(SENTRY_URL && "handleDailyJob", '20 20 20 * * *', async () => {
      console.log('every day ....', services);

      await sendMessage(subdomain, 'handleDailyJob', services);
    });


  })
  .catch((e) =>
    console.log(`Error ocurred during message broker init ${e.message}`),
  );
