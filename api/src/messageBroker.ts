import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import {
  receiveEngagesNotification,
  receiveIntegrationsNotification,
  receiveRpcMessage
} from './data/modules/integrations/receiveMessage';
import { receiveRpcMessage as receiveAutomations } from './data/modules/automations';
import { pluginsConsume } from './pluginUtils';
import { graphqlPubsub } from './pubsub';
import { receiveVisitorDetail } from './data/widgetUtils';

dotenv.config();

let client;

export const initBroker = async (server?) => {
  client = await messageBroker({
    name: 'api',
    server,
    envs: process.env
  });

  // do not receive messages in crons worker
  if (!['crons', 'workers'].includes(process.env.PROCESS_NAME || '')) {
    const { consumeQueue, consumeRPCQueue } = client;

    // listen for rpc queue =========
    consumeRPCQueue(
      'rpc_queue:integrations_to_api',
      async data => await receiveRpcMessage(data)
    );

    consumeRPCQueue(
      'rpc_queue:automations_to_api',
      async data => await receiveAutomations(data)
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

    consumeQueue('visitor:convertResponse', async data => {
      await receiveVisitorDetail(data);
    });

    pluginsConsume(client);
  }
};

export default function() {
  return client;
}
