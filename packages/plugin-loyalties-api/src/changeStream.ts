import redis from '@erxes/api-utils/src/redis';
import * as mongoose from 'mongoose';
import { sendCommonMessage } from './messageBroker';

const getSubdomain = (domain: string) => {
  const hostname = domain.replace(/^(https?:\/\/)/, '');

  const firstPart = hostname.split('.')[0];

  return firstPart.split(':')[0];
};

export default async () => {
  const db = mongoose.connection;

  const changeStream = db
    .collection('customers')
    .watch([{ $match: { operationType: 'insert' } }]);

  const hostname = await redis.get('hostname');

  if (!hostname || !changeStream) {
    return;
  }

  const subdomain = getSubdomain(hostname);

  changeStream.on('change', async (data: any) => {
    try {
      if (data.operationType === 'insert') {
        sendCommonMessage({
          subdomain,
          serviceName: 'automations',
          action: 'trigger',
          data: {
            type: 'loyalties:reward',
            targets: [data.fullDocument],
          },
          defaultValue: [],
        });
      }
    } catch (error) {
      console.error('Error handling change event:', error);
    }
  });

  changeStream.on('error', (error) => {
    console.error('Error in customer stream:', error);
    changeStream.close();
  });

  (['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((sig) => {
    process.on(sig, async () => {
      console.log('Closing change stream...');
      await changeStream.close();
    });
  });
};
