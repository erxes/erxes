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

      const token = await generateToken(integrationId, username, password);

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

  consumeRPCQueue(
    'calls:api_to_integrations',
    async (args: ISendMessageArgs): Promise<any> => {
      const { data } = args;
      const { inboxId, action } = data;

      const integration = await Integrations.findOne({ inboxId });

      if (!integration) {
        return {
          status: 'failed',
          data: 'integration not found.'
        };
      }

      switch (action) {
        case 'getConfigs':
          return {
            status: 'success',
            data: integration
          };
        default:
          return {
            status: 'failed',
            data: 'action not found.'
          };
      }
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
