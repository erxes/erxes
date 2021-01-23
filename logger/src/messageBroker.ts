import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import Visitors from './models/Visitors';
import { receivePutLogCommand } from './utils';

dotenv.config();

let client;

export const initBroker = async server => {
  client = await messageBroker({
    name: 'logger',
    server,
    envs: process.env
  });

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('putLog', async data => {
    await receivePutLogCommand(data);
  });

  consumeQueue('visitorLog', async parsedObject => {
    const { data, action } = parsedObject;

    switch (action) {
      case 'update':
        return Visitors.updateVisitorLog(data);
      case 'createOrUpdate':
        return Visitors.createOrUpdateVisitorLog(data);
      case 'remove':
        return Visitors.removeVisitorLog(data.visitorId);
      default:
        break;
    }
  });

  consumeRPCQueue('rpc_queue:visitorLog', async parsedObject => {
    const { action, data } = parsedObject;

    let response = null;

    try {
      if (action === 'get') {
        response = { data: await Visitors.getVisitorLog(data.visitorId) };
      }

      response.status = 'success';
    } catch (e) {
      response = {
        status: 'error',
        errorMessage: e.message
      };
    }

    return response;
  });
};

export default function() {
  return client;
}
