import redis from '@erxes/api-utils/src/redis';
import * as mongoose from 'mongoose';
import { sendCommonMessage } from './messageBroker';

const getSubdomain = (domain: string) => {
  const hostname = domain.replace(/^(https?:\/\/)/, '');
  
  const firstPart = hostname.split('.')[0];
  
  return firstPart.split(':')[0];
}

export default async () => {
  const db = mongoose.connection;
  const changeStream = db.collection('customers').watch();

  const hostname = await redis.get('hostname');

  if (!hostname || !changeStream) {
    return;
  }

  const subdomain = getSubdomain(hostname)

  changeStream.on('change', (data: any) => {
    const { operationType, fullDocument } = data;

    if (operationType === 'insert') {
      sendCommonMessage({
        subdomain,
        serviceName: 'automations',
        action: 'trigger',
        data: {
          type: 'loyalties:promotion',
          targets: [fullDocument],
        },
        defaultValue: [],
      });
    }
  });

  changeStream.on('error', (error) => {
    console.error('Error in customer stream:', error);
  });
};
