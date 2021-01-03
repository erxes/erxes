import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';

import {
  receiveEngagesNotification,
  receiveIntegrationsNotification,
  receiveRpcMessage
} from './data/modules/integrations/receiveMessage';
import { getEnv } from './data/utils';
import memoryStorage from './inmemoryStorage';
import { allModels, pluginsConsumers } from './pluginUtils';
import { graphqlPubsub } from './pubsub';

dotenv.config();

let client;

export const initBroker = async (server?) => {
  client = await messageBroker({
    name: 'api',
    server,
    envs: process.env
  });

  const prefix = getEnv({ name: 'MESSAGE_BROKER_PREFIX' })

  const { consumeQueue, consumeRPCQueue } = client;

  // listen for rpc queue =========
  consumeRPCQueue('rpc_queue:integrations_to_api'.concat(prefix), async data =>
    receiveRpcMessage(data)
  );

  // graphql subscriptions call =========
  consumeQueue('callPublish'.concat(prefix), params => {
    graphqlPubsub.publish(params.name, params.data);
  });

  consumeQueue('integrationsNotification'.concat(prefix), async data => {
    await receiveIntegrationsNotification(data);
  });

  consumeQueue('engagesNotification'.concat(prefix), async data => {
    await receiveEngagesNotification(data);
  });

  for (const channel of Object.keys(pluginsConsumers)) {
    const mbroker = pluginsConsumers[channel]
    if (mbroker.method === "RPCQueue") {
      consumeRPCQueue(
        channel.concat(prefix),
        async msg => mbroker.handler(
          msg, {
          models: allModels,
          memoryStorage,
          graphqlPubsub
        }
        )
      );
    } else {
      consumeQueue(
        channel.concat(prefix),
        async msg => {
          await mbroker.handler(
            msg, {
            models: allModels,
            memoryStorage,
            graphqlPubsub
          }
          )
        }
      );
    }
  }
};

export default function () {
  return client;
}
