import { init } from './messageBrokerErkhetHelper';
import { consumeCustomer } from './utils/consumeCustomer';
import {
  consumeInventory,
  consumeInventoryCategory
} from './utils/consumeInventory';
import redis from '@erxes/api-utils/src/redis';
import { generateModels, IModels } from './connectionResolver';
import { ISyncLogDocument } from './models/definitions/syncLog';

let clientErkhet;

export const initBrokerErkhet = async () => {
  clientErkhet = await erkhetBroker();

  const { consumeQueue } = clientErkhet;

  consumeQueue('rpc_queue:erkhet', async ({ subdomain, data }) => {
    const { object, old_code, action, api_key, api_secret } = data;
    const models = await generateModels(subdomain);

    const configs = await models.Configs.getConfig('erkhetConfig', {});
    const allConfigs = (Object.values(configs) || []) as any[];

    const config = allConfigs.find(
      c =>
        c.apiKey === api_key &&
        c.apiSecret === api_secret &&
        c.apiToken === subdomain
    );

    if (!config) {
      return;
    }

    const objectData = JSON.parse(object)[0];
    const doc = objectData.fields;
    const kind = objectData.model;

    switch (kind) {
      case 'inventories.inventory':
        await consumeInventory(subdomain, config, doc, old_code, action);
        break;
      case 'inventories.category':
        await consumeInventoryCategory(
          subdomain,
          config,
          doc,
          old_code,
          action
        );
        break;
      case 'customers.customer':
        await consumeCustomer(subdomain, config, doc, old_code, action);
        break;
    }

    return;
  });
};

export const sendRPCMessage = async (
  models: IModels,
  syncLog: ISyncLogDocument,
  channel: string,
  message: any
): Promise<any> => {
  await models.SyncLogs.updateOne(
    { _id: syncLog._id },
    { $set: { sendData: message, sendStr: JSON.stringify(message) } }
  );
  const response = await clientErkhet.sendRPCMessage(channel, message);
  if (typeof response === 'string') {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { responseStr: JSON.stringify(response), error: response } }
    );
  } else {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: { responseData: response, responseStr: JSON.stringify(response) }
      }
    );
  }
  return response;
};

// send temp rpc message == no log message
export const sendTRPCMessage = async (channel, message): Promise<any> => {
  return clientErkhet.sendRPCMessage(channel, message);
};

export const erkhetBroker = async () => {
  const { ERKHET_RABBITMQ_HOST, ERKHET_MESSAGE_BROKER_PREFIX } = process.env;

  return await init({
    RABBITMQ_HOST: ERKHET_RABBITMQ_HOST,
    MESSAGE_BROKER_PREFIX: ERKHET_MESSAGE_BROKER_PREFIX,
    redis
  });
};

export default function() {
  return clientErkhet;
}
