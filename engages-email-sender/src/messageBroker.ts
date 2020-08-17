import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { debugBase } from './debuggers';
import { Logs } from './models';
import { sendSms, start } from './sender';

dotenv.config();

let client;

export const initBroker = async () => {
  client = await messageBroker({ name: 'logger', RABBITMQ_HOST: process.env.RABBITMQ_HOST });

  const { consumeQueue } = client;

  // listen for rpc queue =========
  consumeQueue('erxes-api:engages-notification', async ({ action, data }) => {
    debugBase(`Receiving queue data from erxes-api`, data);

    if (action === 'sendEngage') {
      await start(data);
    }

    if (action === 'writeLog') {
      await Logs.createLog(data.engageMessageId, 'regular', data.msg);
    }

    if (action === 'sendEngageSms') {
      await sendSms(data);
    }
  });
};

export default function() {
  return client;
}
