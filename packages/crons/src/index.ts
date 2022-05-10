import * as schedule from 'node-schedule';
import { initBroker, sendCommonMessage } from './messageBroker';
import { redis, getServices } from './serviceDiscovery';

const { RABBITMQ_HOST } = process.env;

initBroker({ RABBITMQ_HOST, redis })
  .then(() => {
    console.log('Crons is running ....');

    schedule.scheduleJob('* * * * *', async () => {
      const services = await getServices();

      console.log('every minute ....', services);

      sendCommonMessage({
        subdomain: 'os',
        serviceName: 'core',
        action: 'runCrons',
        data: {}
      });
    });
  })
  .catch(e =>
    console.log(`Error ocurred during message broker init ${e.message}`)
  );
