import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import {
  receiveEngagesNotification,
  receiveIntegrationsNotification,
  receiveRpcMessage
} from './data/modules/integrations/receiveMessage';
import { graphqlPubsub } from './pubsub';

dotenv.config();

let client;

export const initBroker = async (server?) => {
  client = await messageBroker({
    name: 'api',
    server,
    envs: process.env
  });

  const { consumeQueue, consumeRPCQueue } = client;

  // listen for rpc queue =========
  consumeRPCQueue('rpc_queue:integrations_to_api', async data =>
    receiveRpcMessage(data)
  );

  // graphql subscriptions call =========
  consumeQueue('callPublish', params => {
    graphqlPubsub.publish(params.name, params.data);
  });

  consumeQueue('integrationsNotification', async data => {
    await receiveIntegrationsNotification(data);
  });

  consumeQueue('engagesNotification', async data => {
    await receiveEngagesNotification(data);
  });
};

export default function() {
  return client;
}
