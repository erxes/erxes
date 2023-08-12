import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { Callss, Integrations } from './models';
import { generateToken } from './utils';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('calls:send', async ({ data }) => {
    Callss.send(data);

    return {
      status: 'success'
    };
  });

  consumeRPCQueue('calls:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Callss.find({})
    };
  });

  consumeRPCQueue(
    'calls:createIntegration',
    async (args: ISendMessageArgs): Promise<any> => {
      const { subdomain, data } = args;
      const { integrationId, doc } = data;
      const docData = JSON.parse(doc.data);

      const { username, password, ...rest } = docData;

      const token = generateToken(integrationId, username, password);

      await Integrations.create({
        inboxId: integrationId,
        username,
        password,
        token,
        ...rest
      });

      return {
        status: 'success'
      };
    }
  );
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
