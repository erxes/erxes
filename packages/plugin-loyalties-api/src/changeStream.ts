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

  let documents: any[] = [];
  let timer: NodeJS.Timeout | null = null;

  const processMessage = async () => {
    if (documents.length === 0) return;

    try {
      await sendCommonMessage({
        subdomain,
        serviceName: 'automations',
        action: 'trigger',
        data: {
          type: 'loyalties:promotion',
          targets: documents,
        },
        defaultValue: [],
      });

      documents = [];
    } catch (error) {
      console.error('Error processing documents:', error);
    }

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  changeStream.on('change', async (data: any) => {
    try {
      if (data.operationType === 'insert') {
        documents.push(data.fullDocument);

        if (documents.length >= 10) {
          await processMessage();
        } else if (!timer) {
          timer = setTimeout(processMessage, 5000);
        }
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
      process.exit(0);
    });
  });
};
